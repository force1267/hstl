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

        visit TEXT,
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
    VALUES ('Admin', 'Admin', '0911', 'admin', 'admin', 7)`);
});

db.close(e => (console.log("DB created !"),callback?callback(db):false));
var callback = false;
module.exports = { then(cb) { callback = cb } }