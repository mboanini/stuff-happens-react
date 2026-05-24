import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams} from 'react-router-dom';
import { Button, Card, Modal} from 'react-bootstrap';
import React from 'react';
import Timer from './TimerComponent'
import './GameComponent.css';
import { API } from '../API.mjs';
import AuthContext from '../context/AuthContext';

function GameComponent() {
    const { user } = useContext(AuthContext);
    const isDemo = !user;
    const { gameId } = useParams();
    const [roundNumber, setRoundNumber] = useState(1);
    const [cards, setCards] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null); 
    const [timerKey, setTimerKey] = useState(0);
    const [timerExpired, setTimerExpired] = useState(false);
    const [incorrectGuesses, setIncorrectGuesses] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [roundReady, setRoundReady] = useState(false);
    const [roundEnded, setRoundEnded] = useState(false);
    const [roundResult, setRoundResult] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const location = useLocation();
    const demoCards = location.state?.cards || [];
    const demoCurrentCard = location.state?.currentCard || null;
    
    const [showRoundModal, setShowRoundModal] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [expiredDueToTimeout, setExpiredDueToTimeout] = useState(false);

    const handleRestart = async () => {
        try {
            const { gameId } = await API.startGame();

            setRoundNumber(1);
            setCards([]);
            setCurrentCard(null);
            setSelectedPosition(null);
            
            setTimerKey(0);
            setTimerExpired(false);
            
            setIncorrectGuesses(0);
            setGameOver(false);
            
            setRoundEnded(false);
            setRoundResult(null);
            
            setShowRoundModal(false);
            setShowGameOverModal(false);
            setExpiredDueToTimeout(false);

            navigate(`/game/${gameId}`);
        } catch (error) {
        console.error("Error starting the game:", error);
        }
    };

    const resetRoundState = () => {
        setSelectedPosition(null);
        
        setTimerExpired(false);
        setTimerKey( prev => prev + 1 );
        
        setRoundReady(false);
        setRoundEnded(false);
        setRoundResult(null);
        
        setShowRoundModal(false);
        setShowGameOverModal(false);
        setExpiredDueToTimeout(false);
    }


    const startRound = async () => {
        try{
            const card = await API.getNextCard(gameId);
            setCurrentCard(card);
            resetRoundState();
            setRoundReady(true);
        } catch (err) {
            console.error("Errorloading new card:", err);
        }
    }

    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            try {
                const data = await API.getGame(gameId); 
                setCards(data.cards);
                setRoundNumber(1); 
                await startRound();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        const initDemo = async () => {
            setLoading(true);
            try {
                setCards(demoCards);
                setRoundNumber(1); 
                setCurrentCard(demoCurrentCard);
                resetRoundState();
            }
            catch (err) {
                console.error("Error starting demo:", err);
            } finally {
                setLoading(false);
            }
        }

        if (isDemo) {
            initDemo();
        } else {
            fetchGame();
        }
    }, [gameId, isDemo]);
    
    if (loading) return <p>Loading game...</p>;

    const handleExpire = async () => {
        if (roundEnded || !roundReady) return;

        setTimerExpired(true);
        setRoundEnded(true);
        setShowRoundModal(true);
        setRoundResult("fail");
        setIncorrectGuesses(prev => prev + 1);
        setExpiredDueToTimeout(true);
        
        if (!isDemo) {
            try {
                await API.roundTimeout(gameId);
            } catch (err) {
                console.error("Round timeout update error:", err);
            }
        }
    };
     

    const submitGuess = async (selectedPosition) => {
        setRoundEnded(true);
        if (isDemo) {
            const sorted = [...cards].sort((a, b) => a.badLuckIndex - b.badLuckIndex);

            const correctIndex = sorted.findIndex(c => currentCard.badLuckIndex < c.badLuckIndex);
            const correctPosition = correctIndex === -1 ? sorted.length + 1 : correctIndex + 1;

            const isCorrect = selectedPosition === correctPosition;

            if (isCorrect) {
                setCards(prev => {
                    const newCards = [...prev, currentCard];
                    newCards.sort((a,b) => a.badLuckIndex - b.badLuckIndex);
                    return newCards
                });
                    
                setRoundResult("success");
            } else {
                setIncorrectGuesses(prev => prev + 1);
                setRoundResult("fail");
            }

            setShowRoundModal(true);   

        }
        else {
            try {
                const result = await API.guessCard(gameId, currentCard.cardId, selectedPosition); // POST /api/games/:id/guess
                if (result.result === "correct" || result.result === "win") {
                    setCards(prev => {
                        const updated = [...prev, result.card];
                        
                        return updated.sort((a,b) => a.badLuckIndex - b.badLuckIndex);
                    });
                    setRoundResult("success");
                    if (result.result === "win")
                        setGameOver(true);
                } else if (result.result === "wrong" || result.result === "lose") {
                    setIncorrectGuesses(prev => prev + 1);
                    setRoundResult("fail");
                    if (result.result === "lose")
                        setGameOver(true);
                }
            } catch (err) {
                console.error("Error while guessing:", err);
            }
            setShowRoundModal(true);   
        }   
    };


    return (
        <>
            <div className="background-blur" />
        
            <div>
                <div className="game-header">
                    <div className="header-section">
                        <span className="header-label mt-3">Time Left</span>
                        <span className="header-value">
                            {isDemo ? (
                                <Timer
                                    duration={30}
                                    onExpire={() => {
                                    setTimerExpired(true);
                                    if (selectedPosition === null) {
                                        setIncorrectGuesses(prev => prev + 1);
                                        setRoundResult("fail");
                                        setExpiredDueToTimeout(true);
                                    }
                                    setRoundEnded(true);
                                    setShowRoundModal(true);
                                    }}
                                    active={!roundEnded}
                                />
                                ) : (
                                <Timer
                                    gameId={gameId}
                                    onExpire={handleExpire}
                                    active={roundReady && !roundEnded}
                                />
                            )}
                        </span>
                    </div>
                    {!isDemo && (
                        <div className="header-section">
                            <span className="header-label">Round</span>
                            <span className="header-value">{roundNumber}</span>
                        </div>
                    )}

                    <div className="header-section">
                        <span className="header-label">Collected Cards</span>
                        <span className="header-value">{cards.length}/6</span>
                    </div>
                    <div className="header-section">
                        <span className="header-label">Errors</span>
                        <span className="header-value">{incorrectGuesses}/3</span>
                    </div>
                </div>


                {currentCard && (
                    <div className="mt-2 flex flex-col items-center gap-2 px-1">
                        {/* Card to place */}
                        <div className = "w-full d-flex justify-content-center my-4">
                            <div className="w-full flex justify-center ">
                                <Card className = "custom-card">
                                    <Card.Img variant="top" src={`http://localhost:3001/static/assets/${currentCard.image}`} alt={currentCard.name}/>
                                    <Card.Body className="d-flex flex-column align-items-center justify-between">
                                        <Card.Text className="card-name">{currentCard.name}</Card.Text>
                                        {
                                            roundResult === "success" && (
                                                <Button className="badluck-button">{currentCard.badLuckIndex}</Button>
                                            )
                                        }
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                        {/* Card placement */}
                        <div className="w-full max-w-2xl flex flex-col items-center gap-2">
                            
                            <div className="d-flex flex-row flex-wrap justify-content-center align-items-end gap-3 px-2">
                                {[...Array(cards.length + 1)].map((_, idx) => (
                                    <React.Fragment key={`slot-${idx}`}>
                                    {/* Button + */}
                                    <div className="d-flex align-items-center slot-button-wrapper">
                                        <button
                                            onClick={() => {
                                                if(!timerExpired && !roundEnded) {
                                                    const pos = idx + 1;
                                                    setSelectedPosition(pos)
                                                    submitGuess(pos);
                                                }
                                            }}         
                                            disabled={timerExpired}
                                            className={`btn btn-sm mb-2 plus-button ${
                                            selectedPosition === idx + 1 ? 'btn-primary' : 'btn-outline-primary'
                                        }`}
                                        >
                                        +
                                        </button>
                                    </div>

                                    {/* Cards */}
                                    {idx < cards.length && (
                                        <Card className="custom-card">
                                        <Card.Img
                                            variant="top"
                                            src={`http://localhost:3001/static/assets/${cards[idx].image}`}
                                            alt={cards[idx].name}
                                        />
                                        <Card.Body className="d-flex flex-column align-items-center justify-between">
                                            <Card.Text className="card-name">{cards[idx].name}</Card.Text>
                                            <Button className="badluck-button">{cards[idx].badLuckIndex}</Button>
                                        </Card.Body>
                                        </Card>
                                    )}
                                    </React.Fragment>
                                ))}
                            </div>


                        </div>
                    </div>
                )}

                <Modal show={showRoundModal} onHide={() => setShowRoundModal(false)} centered backdrop="static" keyboard={false} className="game-modal">
                    <Modal.Header closeButton={false}>
                        <Modal.Title>Round Over</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {roundResult === "success" ? (
                            <p className="fs-5">You got it!</p>
                        ) : expiredDueToTimeout ? (
                            <p className="fs-5"> Time's up! </p>
                        ) : (
                            <p className="fs-5">Oops, wrong..Try Again!</p>
                        )}
                        <h5 className="mt-4">Are you ready to start a new round?</h5>
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center">
                        <Button
                        variant="warning" className="px-4 py-2 fw-bold"
                        onClick={() => {
                            setShowRoundModal(false);
                            if (isDemo || cards.length >= 6 || incorrectGuesses >= 3) {
                                setGameOver(true);
                                setShowGameOverModal(true); 
                            } else {
                                setRoundNumber(prev => prev + 1);
                                startRound();
                            }
                        }}
                        >
                            Ready!
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showGameOverModal} onHide={() => navigate('/')} centered backdrop="static" keyboard={false} className="game-modal">
                    <Modal.Header closeButton={false} className="bg-dark text-white">
                        <Modal.Title>{isDemo ? 'Demo Finished' : (cards.length >= 6 ? 'You are the winner!' : 'Better luck next time!')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        {isDemo ? (
                        <>
                            <p className="fs-5">Want to play more? Register now and unlock all rounds!</p>
                        </>
                        ) : (
                        <>
                            <h5>Collected Cards:</h5>
                            <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
                                {cards.map(card => (
                                    <div key={card.cardId} className="text-center">
                                    <img
                                        src={`http://localhost:3001/static/assets/${card.image}`}
                                        alt={card.name}
                                        width="60"
                                        className="rounded shadow-sm"
                                    />
                                    <div>{card.name}</div>
                                    <small className="text-muted">Bad Luck Index: {card.badLuckIndex}</small>
                                    </div>
                                ))}
                            </div>
                        </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center">
                        {isDemo ? (
                            <>
                                <Button variant="warning" onClick={() => navigate('/login')}>Go to Login</Button>
                                <Button variant="secondary" onClick={() => navigate('/')}>Return To Home</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="warning" onClick={handleRestart}>New Game</Button>
                                <Button variant="secondary" onClick={() => navigate('/')}>Return To Home</Button>
                            </>
                        )}
                    </Modal.Footer>
                </Modal>            
            </div>
        </>
    );
}


export default GameComponent;