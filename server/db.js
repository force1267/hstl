const sqlite3 = require("sqlite3");
const db = new sqlite3.cached.Database("./DB");
db.api = {
    getUserById(id, cb) { // cb(err, user)
        db.all(`SELECT * FROM user WHERE id = ?`, [id], (err, rows) => {
            if(rows.length === 1) {
                cb(err, rows[0]);
            } else {
                cb(err, false);
            }
        });
    },
    getUserByUserPass(user, pass, cb) { // cb(err, user)
        db.all(`SELECT * FROM user WHERE username = ? AND password = ?`, [user, pass], (err, rows) => {
            if(rows.length === 1) {
                cb(err, rows[0]);
            } else {
                cb(err, false);
            }
        });
    },
};

module.exports = db;