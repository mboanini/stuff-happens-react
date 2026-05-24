import { Button, Container, Collapse } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { motion } from "framer-motion";

import AuthContext from "../context/AuthContext";
import { API } from "../API.mjs";

function HomeComponent() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStart = async () => {
    try {
      if (user) {
        const { gameId } = await API.startGame();
        navigate(`/game/${gameId}`);
      } else {
        const { cards, currentCard } = await API.startDemoGame();
        navigate("/game/demo", { state: { cards, currentCard } });
      }
    } catch (error) {
      console.error("Error starting the game:", error);
    }
  };

  return (
    <>
      <div className="background-blur" />
      <Container className="text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "84vh" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="p-4 rounded shadow"
          style={{
            backgroundColor: "#4B0082",
            color: "#FFD700",
            maxWidth: "700px",
            width: "100%",
          }}
        >
          <h1 className="mb-1 fw-bold text-warning">Stuff Happens</h1>
          <h5 className="mb-4 fst-italic" style={{ color: "#D8BFD8" }}>
            Life as an Out-of-Town Student
          </h5>
          <p className="lead">
            Misfortunes are everywhere... Can you guess how bad they really are?
          </p>
  
          <div className="d-flex justify-content-center gap-4 mt-4 flex-wrap">
            
            { !user && (
              <Button
                onClick={() => setShowInstructions(!showInstructions)}
                variant="outline-light"
                className="mt-3 px-4 py-2 fw-bold"
                style={{ minWidth: '180px' }}
                aria-controls="instructions-collapse"
                aria-expanded={showInstructions}
              >
                {showInstructions ? "Hide Instructions" : "Show Instructions"}
              </Button>
            )}

            <Button
              onClick={handleStart}
              variant="warning"
              className="mt-3 px-4 py-2 fw-bold"
              style={{ minWidth: '180px' }}
            >
              Let's play!
            </Button>
          
          </div>

          <Collapse in={showInstructions}>
              <div id="instructions-collapse" className="text-start mt-4 px-3">
                <p><strong>Game Rules:</strong></p>
                <ul style={{ paddingLeft: "1rem" }}>
                  <li>You start with 3 random situation cards.</li>
                  <li>Each round, a new situation is shown (without the index).</li>
                  <li>You must guess where it fits based on your current cards.</li>
                  <li>You have 30 seconds to place it correctly.</li>
                  <li>If correct, the card is added to your collection.</li>
                  <li>The game ends when you collect 6 cards (win) or miss 3 (lose).</li>
                </ul>
              </div>
          </Collapse>
            
        </motion.div>
      </Container>
    </>
  );
}

export default HomeComponent;