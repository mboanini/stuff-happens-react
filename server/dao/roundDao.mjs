import db from '../db/db.mjs';

export default function roundDao() {
    /**
     * Get all rounds for a game
     * @param {number} gameId
     * @return {Promise<Array<object>>}
     */
    this.getRoundsByGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM round WHERE gameId=? ORDER BY roundId ASC";
            db.all(sql, [gameId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const rounds = rows.map(row => ({
                        roundId: row.roundId,
                        gameId: row.gameId,
                        roundNumber: row.roundNumber,
                        cardId: row.cardId,
                        result: row.result,
                        position: row.position,
                    }));
                    resolve(rounds);
                }
            });
        });
    };

    /**
     * Add a new round
     * @param {number} gameId
     * @param {number} cardId
     * @param {number} roundNumber
     * @param {string} result - 'won' or 'lost'
     * @param {number} position
     * @return {Promise<number>} - Returns the created round ID
     */
    this.addRound = (gameId, cardId, roundNumber, result, position, startTime) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO round (gameId, cardId, roundNumber, result, position, startTime) VALUES (?, ?, ?, ?, ?, ?)";
            db.run(sql, [gameId, cardId, roundNumber, result, position, startTime], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    /**
     * Update position of a card in a round
     * @param {number} roundId
     * @param {number} position
     * @return {Promise<void>}
     */
    this.updatePosition = (roundId, position) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE round SET position = ? WHERE roundId = ?";
            db.run(sql, [position, roundId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Update the result of a round
     * @param {number} roundId
     * @param {string} result - 'won' or 'lost'
     * @return {Promise<void>}
     */
    this.updateResult = (roundId, result) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE round SET result = ? WHERE roundId = ?";
            db.run(sql, [result, roundId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get the last round by game
     * @param {number} gameId
     * @return {Promise<object>}
     */
    this.getLastRoundByGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM round WHERE gameId=? ORDER BY roundId DESC LIMIT 1";
            db.get(sql, [gameId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
            });
        });
    };
}