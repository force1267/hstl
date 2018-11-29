#!/usr/bin/env node

console.log(`starting process PID ${process.pid}`)

// flags
// --remove-db : backup and delete DB
if(process.argv.includes("--remove-db")) {
    const fs = require('fs');
    if (fs.existsSync("./DB")) {
        console.log("DB exists. deleting ...");
        fs.renameSync("./DB", "./DB.backup");
        console.log("DB was backed up and deleted !");
    }
    process.exit();
}

// init db
const fs = require("fs");
if (!fs.existsSync("./DB")) {
    console.log("DB does not exist !");
    require("./server/initdb.js");
}


// server
const {server, db} = require("./server/server.js");
const port = process.argv[2] || process.env.PORT || 8080;
server.listen(port);
console.log(`listening to ${port}`);

// gentle exit
function exit() {
    setTimeout(e => {
        process.exit(0);
    }, 1000);
}
process.on('SIGTERM', () => {
    var done = false;
    db.close(() => {
        done = done ? process.exit(0) : true;
    });
    server.close(() => {
        done = done ? process.exit(0) : true;
    });
});