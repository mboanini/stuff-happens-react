import db from '../db/db.mjs';

export default function cardInGameDao() {
    /**
     * Get cards involved in a game
     * @param {number} gameId 
     * @returns {Promise<cardInGame[]>} 
     */
    this.getCardsInGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT cardInGame.*, card.name, card.badLuckIndex 
                         FROM cardInGame 
                         JOIN card ON cardInGame.cardId = card.cardId 
                         WHERE gameId = ? 
                         ORDER BY badLuckIndex ASC`;
            db.all(sql, [gameId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get cards won in a game
     * @param {number} gameId 
     * @returns {Promise<cardInGame[]>}
     */
    this.getCardsWonInGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT cardInGame.*, card.name, card.badLuckIndex 
                         FROM cardInGame 
                         JOIN card ON cardInGame.cardId = card.cardId 
                         WHERE gameId = ? AND outcome == 1
                         ORDER BY badLuckIndex ASC`;
            db.all(sql, [gameId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    /**
     * Get cards involved in a game with details
     * @param {number} gameId 
     * @returns {Promise<object[]>}
     */
    this.getCardsInGameWithDetails = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT cig.gameId, cig.cardId, cig.outcome, cig.wonInRound, c.name, c.image, c.badLuckIndex
                        FROM cardInGame AS cig
                        JOIN card AS c ON cig.cardId = c.cardId
                        WHERE cig.gameId = ?
                        ORDER BY cig.wonInRound ASC`;
            db.all(sql, [gameId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            })
        })
    }

    /**
     * Add a card to a game
     * @param {number} gameId 
     * @param {number} cardId 
     * @param {number} outcome - 1 if the card was won in the round, 0 otherwise
     * @param {number} wonInRound 
     * @return {Promise<object>} - Returns the created cardInGame object
     */
    this.addCardInGame = (gameId, cardId, outcome, wonInRound) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO cardInGame (gameId, cardId, outcome, wonInRound) VALUES (?, ?, ?, ?)`;
            db.run(sql, [gameId, cardId, outcome, wonInRound], function(err) {
                if (err) {
                    reject(err);
                } else {
                    const cardInGame = { gameId: gameId, cardId: cardId, outcome: outcome,wonInRound: wonInRound };
                    resolve(cardInGame);
                }
            });
        });
    }

    /**
     * Get number of cards collected in a game
     * @param {number} gameId
     * @return {Promise<number>} - Returns the number of cards collected in the game
     */
    this.getNumberOfCardsWonInGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as count FROM cardInGame WHERE gameId = ? AND outcome == 1`;
            db.get(sql, [gameId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    /**
     * Get number of cards lost in a game
     * @param {number} gameId
     * @return {Promise<number>} - Returns the number of cards lost in the game
     */
    this.getNumberOfCardsLostInGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as count FROM cardInGame WHERE gameId = ? AND wonInRound == 0`;
            db.get(sql, [gameId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    /**
     * Get the number of cards in a game
     * @param {number} gameId
     * @return {Promise<number>} - returns the number of cards involved in the game
     */
    this.getNumberOfCardsInGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as count FROM cardInGame WHERE gameId = ?`;
            db.get(sql, [gameId], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            })
        })
    }
}