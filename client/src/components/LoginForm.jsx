import {Alert, Button, Col, Form, Row, Spinner} from 'react-bootstrap';
import {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {API} from "../API.mjs";
import AuthContext from "../context/AuthContext.jsx";

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [waiting, setWaiting] = useState(false);

    const navigate = useNavigate();
    const {setUser} = useContext(AuthContext)

    const login = async () => {
        try {
            const user = await API.login({email, password});
            setUser(user);
            navigate("/");
        } catch (e) {
            setShow(true);
            setErrorMessage(e.message);
        }

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setWaiting(true)
        login().finally(() => setWaiting(false));
    };

    return (
        <>
            {waiting && <Alert variant='secondary'>Please wait for the server response</Alert>}
            <Row className="mt-3 vh-100 justify-content-md-center">
                <Col md={4}>
                    <h1 className="pb-3">Login</h1>
                    <Form onSubmit={handleSubmit}>
                        <Alert
                            dismissible
                            show={show}
                            onClose={() => setShow(false)}
                            variant="danger">
                            {errorMessage}
                        </Alert>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email} placeholder="Example: john.doe@polito.it"
                                onChange={(ev) => setEmail(ev.target.value)}
                                required={true}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password} placeholder="Enter the password"
                                onChange={(ev) => setPassword(ev.target.value)}
                                required={true}
                            />
                        </Form.Group>
                        <Button className="mt-3" type="submit" variant="warning" disabled={waiting}>Login{" "}
                        <Spinner hidden={!waiting} size={"sm"} />
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}


export default LoginForm;