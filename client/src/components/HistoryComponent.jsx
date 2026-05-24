import { useEffect, useState, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { API } from '../API.mjs'
import { Container, Alert, Spinner, Badge } from 'react-bootstrap'
import { BsCheckCircle, BsXCircle } from 'react-icons/bs'
import dayjs from 'dayjs'

function HistoryComponent() {
    const { user } = useContext(AuthContext)
    const [history, setHistory] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await API.getUserGameHistory();
                setHistory(data);
            } catch (err) {
                setError("Unable to load history");
            } finally {
                setLoading(false);
            }
        }

        if (user) loadHistory();
    }, [user]);

    if (!user) { return (
        <div className="d-flex justify-content-center align-items-center mt-5">
            <Alert variant="danger" className="text-center p-4 shadow">Access restricted to registered users</Alert> 
        </div>
    )}
    if (loading) return <div className="text-center my-5"><Spinner animation="border" variant="warning" /></div>

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-5 fw-bold" style={{ color: '#6f42c1' }}> Your Game History </h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {history.length === 0 ? (
                <Alert variant="warning" className="text-center">No games found</Alert>
            ) : (
                [...history]
                    .sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
                    .map((game, index) => (
                        <div key={game.gameId} className="mb-5 p-4 rounded shadow-sm border" style={{ borderColor: '#6f42c1' }}>
                            {/* Summary */}
                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                <div>
                                    <h4 className="mb-0" style={{ color: '#6f42c1' }}>Game #{game.gameId} </h4>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                        {dayjs(game.startTime).format('DD MMM YYYY [at] HH:mm')}
                                    </p>
                                </div>
                                <Badge bg={game.status === 'won' ? 'success' : game.status === 'lost' ? 'danger' : 'secondary'}
                                    className="fs-6 px-3 py-2 text-uppercase"> {game.status} </Badge>
                            </div>
                            <p className="mb-2 text-muted">Collected <span className="fw-bold" style={{ color: '#ffc107' }}> {game.collectedCards.length} </span>out of <span className="fw-bold">{game.cards.length}</span> cards</p>
                            {/* Cards details */}
                            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 mt-3">
                                {[...game.cards]
                                    .sort((a, b) => a.wonInRound - b.wonInRound)
                                    .map((card) => (
                                    <div key={card.cardId} className="col">
                                        <div className="border rounded p-3 h-100 d-flex flex-column justify-content-between" style={{ borderColor: '#ffc107', backgroundColor: '#fff9e6' }}>
                                        <div className="fw-semibold text-center mb-2" style={{ color: '#6f42c1' }}>
                                            {card.name ? card.name.toUpperCase() : "UNKNOWN"}
                                        </div>
                                        <div className="text-center mt-2">
                                            {card.outcome === 1 ? (
                                            <span className="d-flex align-items-center justify-content-center gap-2 text-success">
                                                <BsCheckCircle size={18} />
                                                <span>Round {card.wonInRound}</span>
                                            </span>
                                            ) : (
                                            <span className="d-flex align-items-center justify-content-center gap-2 text-danger">
                                                <BsXCircle size={18} />
                                                <span>Round {card.wonInRound}</span>
                                            </span>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )
            )}
        </Container>
    );
}

export default HistoryComponent;
