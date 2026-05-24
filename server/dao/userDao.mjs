import db from '../db/db.mjs';
import crypto from 'crypto';

export default function userDao() {

    this.getUser = (email, password) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM user WHERE email=?";
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const salt = row.salt;
                    const db_hashedPassword = row.saltedPassword;
                    const user = {id: row.userId, email: row.email, name: row.name};

                    crypto.scrypt(password, salt, 32, function(err, hashedPassword) {
                        if(err) {
                            reject(err);
                        }
                        if(!crypto.timingSafeEqual(Buffer.from(db_hashedPassword, 'hex'), hashedPassword)) {
                            resolve(false);
                        }
                        else resolve(user);
                    });
                }
            });
        });
    };

    /**
     * Get user by ID
     * @param {number} userId 
     * @return {Promise<object>}
     */

    this.getUserById = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM user WHERE userId=?";
            db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const user = {id: row.userId, email: row.email, name: row.name};
                    resolve(user);
                }
            });
        });
    }

    /**
     * Get userID by email
     * @param {string} email
     * @return {Promise<number|boolean>} Returns userId if found, false otherwise
     */
    this.getUserIdByEmail = (email) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT userId FROM user WHERE email=?";
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    resolve(row.userId);
                }
            });
        });
    }
}