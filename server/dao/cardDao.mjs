import db from '../db/db.mjs';

export default function cardDao() {
    this.getAllCards = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM card ORDER BY badLuckIndex ASC`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    /**
     *  Dato l'id della carta, restituisce la carta corrispondente
     *  @param {number} cardId 
     *  @return {Promise<object>} 
     */
    

    this.getCardById = (cardId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM card WHERE cardId = ?`;
            db.get(sql, [cardId], (err, row) => {
                if (err) {
                    reject(err);
                } 
                else if (row === undefined) {
                    reject(err);
                }else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Returns a random card excluding the ones already used
     * @param {number[]} usedIds
     * @returns {Promise<object>}
     */

    this.getCardExcludingUsedIds = (usedIds) => {
        return new Promise((resolve, reject) => {
            let sql;
            let params;
            if (!usedIds || usedIds.length === 0) {
                // Nessuna carta usata, quindi prendine una random
                sql = `SELECT * FROM card ORDER BY RANDOM() LIMIT 1`;
                params = [];
            } else {
                const placeholders = usedIds.map(() => '?').join(',');
                sql = `
                    SELECT * FROM card
                    WHERE cardId NOT IN (${placeholders})
                    ORDER BY RANDOM()
                    LIMIT 1
                `;
                params = usedIds;
            }

            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error("Nessuna carta disponibile"));
                } else {
                    resolve(row);
                }
            });
        });

    }
}