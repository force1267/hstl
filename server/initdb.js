const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./DB");
db.serialize(function() {
    console.log("creating new DB ...");
    db.run(
    `CREATE TABLE pts(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        meli TEXT,
        firstname TEXT,
        lastname TEXT,
        gender TEXT,
        phone TEXT,

        data TEXT
    )`);
    db.run(
        `CREATE TABLE visit(
            pid INTEGER NOT NULL,
            date DATETIME,
            data TEXT
        )`);
    db.run(
        `CREATE TABLE struct(
            name TEXT,
            shape TEXT
        )`);
    db.run(
        `INSERT INTO struct VALUES(
            'patient_data',
            '{"G6PD":"box","ASM":"box","oper":"box","more":"text"}'
        )`);
    db.run(
    `CREATE TABLE user(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        firstname TEXT,
        lastname TEXT,
        phone TEXT,

        username TEXT UNIQUE,
        password TEXT,
        access INTEGER
    )`);
    db.run(`INSERT INTO user(firstname, lastname, phone, username, password, access) 
    VALUES ('محمد جواد', 'اسدی', '09118971878', 'dev', 'dev', 7)`);
    // access: 0 ban, 1 restricted, 2 user, 3 mod, 5 admin, 7 dev
});

db.close(e => (console.log("DB created !"),callback?callback(db):false));
var callback = false;
module.exports = { then(cb) { callback = cb } }