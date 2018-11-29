for(var i = 2; i < process.argv.length; i++) {
    console.log(process.argv[i], " -> ");
    new (require("sqlite3").Database)("./DB").all(process.argv[i], [], (err, rows) => {
        if (err) {
            console.log("errno", err.errno);
            throw err;
        }
        console.log(rows);
    }).close();
}

// CREATE TABLE pts_table(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT)
// INSERT INTO pts_table(name) VALUES ('mammad')
// DROP TABLE pts_table