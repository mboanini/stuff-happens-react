import db from '../db/db.mjs';

export default function gameDao() {
    this.getGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM game WHERE gameId=?";
            db.get(sql, [gameId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const game = {gameId: row.gameId, userId: row.userId, status: row.status, startTime: row.startTime};
                    resolve(game);
                }
            });
        });
    }

    /**
     * Add a new game
     * @param {number} userId
     * @param {Date} startTime 
     * @return {Promise<number>} - Returns the created game ID
     */
    this.addGame = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO game (userId, status) VALUES (?, ?)";
            db.run(sql, [userId, 'in-progress'], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        })
    }

    /**
     * Get all games for a user with the status of each game
     * @param {number} userId
     * @return {Promise<Array<object>>}
     */
    this.getGamesByUser = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM game WHERE userId=? ORDER BY startTime DESC";
            db.all(sql, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const games = rows.map(row => ({
                        gameId: row.gameId,
                        userId: row.userId,
                        status: row.status,
                        startTime: row.startTime,
                    }));
                    resolve(games);
                }
            });
        });
    }

    /**
     * Update the status of a game
     * @param {number} gameId
     * @return {Promise<void>}
     * 
     */
    this.updateGameStatus = (gameId, status) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE game SET status = ? WHERE gameId = ?";
            db.run(sql, [status, gameId], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
            });
        })
    }

    /**
     * Get history
     * @param {number} userId
     * @param {Promise<object[]>}
     */
    this.getUserGameHistory = (userId) => {
        return new Promise((resolve, reject) => {
            const gameSql = "SELECT * FROM game WHERE userId = ? ORDER BY startTime DESC";
            db.all(gameSql, [userId], (err, games) => {
                if (err) return reject(err);
                if (!games || games.length === 0) return resolve([]);

                const history = [];
                let completed = 0;

                for (const game of games) {
                    const cardSql = `SELECT c.cardId, c.name, c.image, cig.outcome, cig.wonInRound
                                     FROM cardInGame cig
                                     JOIN card c ON c.cardId = cig.cardId
                                     WHERE cig.gameId = ? `;
                    db.all(cardSql, [game.gameId], (cardErr, cards) => {
                        if (cardErr) return reject(cardErr);

                        const collectedCards = cards.filter(card => card.outcome === 1 && card.wonInRound >= 0);

                        history.push({
                            gameId: game.gameId,
                            userId: game.userId,
                            status: game.status,
                            startTime: game.startTime,
                            cards: cards,
                            collectedCards: collectedCards,
                        });

                        completed++;
                        if(completed === games.length) {
                            history.sort((a,b) => new Date(b.startTime) - new Date(a.startTime));
                            resolve(history);
                        }
                    })
                }
            })
        })
    }
}