import "bootstrap-icons/font/bootstrap-icons.css";
import {Container, Navbar, Button, Nav, Modal} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";

import AuthContext from "../context/AuthContext.jsx";
import {API} from "../API.mjs";


function NavbarComponent() {

    const {user, setUser} = useContext(AuthContext);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

    const logout = async () => {
        try {
            await API.logout();
            setUser(null);
            navigate("/");
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    }

    const handleNewGame = async () => {
        try {
            if (user) {
                const { gameId } = await API.startGame(); 
                navigate(`/game/${gameId}`);
            } else {
                const { cards, currentCard } = await API.startDemoGame();
                navigate('/game/demo', { state: { cards, currentCard }});
            }
            
        } catch (err) {
            console.error(err);
            setErrorMessage("Error creating the match");
        }
    };

    return (
        <Navbar className="shadow-sm" style={{ backgroundColor: '#4B0082', padding: "22px 44px" }} variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={NavLink} to="/" className="fw-bold text-warning">
                    StuffHappens
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={NavLink} to="/" className="text-white">Home</Nav.Link>
                    <Nav.Link onClick={handleNewGame} className="text-white">New Game</Nav.Link>
                    { user && (
                        <Nav.Link as={NavLink} to="/history" className="text-white">History</Nav.Link>
                    )}
                </Nav>

                <Nav className="d-flex align-items-center">
                    {user ? (
                    <>
                        <span className="text-white me-3">Hello, {user.name}</span>
                        <Button variant="outline-warning" onClick={logout}>Logout</Button>
                    </>
                    ) : (
                    <Button variant="outline-light" onClick={() => navigate("/login")}>Login</Button>
                    )}
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}


function ErrorModal({errorMessage, setErrorMessage}) {
    const handleClose = () => setErrorMessage(null);

    return (
            <Modal show={errorMessage!==null} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Logout failed</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
    );
}

export default NavbarComponent;

