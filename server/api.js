const passport = require('passport');
function private(req, res, next) {
    if(!req.user) return res.redirect("/login");
    next();
}

module.exports = ({app, db}) => {
    app.get("/ping", private, (req, res) => {
        console.log(req.user.username, "pinged !");
        return res.end("pong " + req.user.firstname);
    });

    app.post('/login', passport.authenticate('local', { failureRedirect: "/login"}), (req, res) => {
        return res.redirect("/app");
    });

    app.get('/login', (req, res) => {
        return res.sendFile("login.html", { root: __dirname + "/../www/" });
    });

    app.get('/logout', (req, res) => {
        req.logout();
        return res.redirect('/');
    });

    app.get("/", (req, res) => {
        return res.redirect("/app");
    });

    app.get('/app', private, (req, res) => {
        console.log(req.user.username, "logged in !");
        return res.sendFile("index.html", { root: __dirname + "/../www/" });
    });

    // real api :
    app.get("/pshape", private, (req, res) => {
        db.api.getPshape((err, rows) => {
            res.json(JSON.parse(rows[0].shape));
        })
    });
    app.get("/search", private, (req, res) => {
        db.api.searchPatient(req.query.q, (err, rows) => {
            var pats = {};
            for(var pat of rows) {
                pats[`${pat.id} ${pat.firstname} ${pat.lastname} ${pat.meli}`] = null;
            }
            res.json(pats);
        });
    });
    // patients :
    app.get("/pat", private, (req, res) => {
        if(req.query.q !== undefined) db.api.searchPatient(req.query.q, (err, rows) => {
            return res.json(rows[0]);
        });
        if(req.query.id !== undefined) db.api.getPatient(req.query.id, (err, rows) => {
            return res.json(rows[0]);
        });
    });
    app.post("/pat/add", private, (req, res) => {
        db.api.addPatient(req.body, (err, rows) => {
            res.json({err, rows});
        });
    });
    app.post("/pat/edit", private, (req, res) => {
        db.api.editPatient(req.body, (err, rows) => {
            res.json({err, rows});
        });       
    });
    app.delete("/pat", private, (req, res) => {
        db.api.deletePatient(req.query.id, (err, rows) => {
            res.json({err, rows});
        })
    });
    // users :
    app.get("/user", (req, res) => {});
}