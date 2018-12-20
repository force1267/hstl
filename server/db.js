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
    searchPatient(key, cb) {
        // var keys = key.split(' ').filter(k => k !== '');
        if(key[0] == "@") {
            key = key.split(' ')[0].slice(1);
            db.all(`SELECT * FROM "pts" WHERE id LIKE ?`, [key], cb);
        } else {
            key += "%";
            db.all(`SELECT * FROM "pts" WHERE
                id LIKE ? OR
                meli LIKE ? OR
                lastname LIKE ? OR
                firstname LIKE ?`, [key, key, key, key], cb);
        }
        
    },
    getPatient(id, cb) {
        db.all(`SELECT * FROM pts WHERE id = ?`, [id], cb);
    },
    getPshape(cb) {
        db.all(`SELECT * FROM struct WHERE name = 'patient_data'`, [], cb);
    },
    addPatient(pat ,cb) {
        db.all(`INSERT INTO pts(firstname, lastname, meli, phone, gender, data) VALUES (?,?,?,?,?,?)`, [pat.firstname,pat.lastname,pat.meli,pat.phone,pat.gender,pat.data], cb);
    },
    editPatient(pat ,cb) {
        db.all(`UPDATE pts SET firstname = ?, lastname = ?, meli = ?, phone = ?, gender = ?, data = ? WHERE id = ?`, [pat.firstname,pat.lastname,pat.meli,pat.phone,pat.gender,pat.data,pat.id], cb);
    },
    deletePatient(id, cb) {
        db.all(`DELETE FROM pts WHERE id = ?`, [id], cb);
    }
};

module.exports = db;