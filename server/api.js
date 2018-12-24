const passport = require('passport');
function private(req, res, next) {
    if(!req.user) return res.redirect("/login");
    next();
}
function access(level) {
    // level: 0 ban, 1 restricted, 2 user, 3 mod, 5 admin, 7 dev
    return (req, res, next) => {
        if(!req.user) return res.redirect("/login");
        if(req.user.access < level) return res.status(403).end();
        next();
    }
}

module.exports = ({app, db}) => {
    app.get("/ping", access(7), (req, res) => {
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
        return res.sendFile("index.html", { root: __dirname + "/../www/" });
    });

    // helper :
    app.get("/pshape", private, (req, res) => {
        db.api.getPshape((err, rows) => {
            res.json(JSON.parse(rows[0].shape));
        });
    });
    app.post("/pshape", access(3), (req, res) => {
        db.api.getPshape((err, rows) => {
            var shape = JSON.parse(rows[0].shape);
            shape[req.body.data] = req.body.shape;
            db.api.setPshape(JSON.stringify(shape), (err, rows) => {
                res.json({err, rows});
            });
        });
    });
    app.delete("/pshape", access(5), (req, res) => {
        db.api.getPshape((err, rows) => {
            var shape = JSON.parse(rows[0].shape);
            delete shape[req.query.data];
            db.api.setPshape(JSON.stringify(shape), (err, rows) => {
                res.send({err, rows});
            });
        });
    });
    app.get("/search", private, (req, res) => {
        db.api.searchPatient(req.query.q, (err, rows) => {
            var pats = [];
            for(var pat of rows) {
                pats.push(`${pat.id} ${pat.firstname} ${pat.lastname} ${pat.meli}`);
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
        if(req.query.all !== undefined) db.api.searchPatient("", (err, rows) => {
            return res.json(rows);
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
    app.get('/visit', access(5), (req, res) => {
        db.api.getVisit(req.query.id, (err, rows) => {
            res.json({err, rows});
        });
    });
    app.post('/visit', access(3), (req, res) => {
        console.log(req.body)
        db.api.addVisit(req.body.pid, req.body.data, (err, rows) => {
            res.json({err, rows});
        });
    });
    // users :
    app.get("/whoami", private, (req, res) => {
        var  us = {
            id: req.user.id,
            name: req.user.username,
            access: req.user.access
        }
        res.json(us);
    });
    app.post("/cp", private, (req, res) => {
        if(req.body.id !== undefined) {
            db.api.changePassword(req.user.id, req.body.password, (err, rows) => {
                res.json({err, rows});
            });
        } else {
            db.api.getUserById(req.body.id, (err, target) => {
                access(target.access)(req, res, () => {
                    db.api.changePassword(target.id, req.body.password, (err, rows) => {
                        res.json({err, rows});
                    });
                });
            });
        }
        
    });
    app.get("/user", access(5), (req, res) => {
        if(req.query.all !== undefined) db.api.getAllUsers((err, rows) => {
            return res.json(rows.map(r => (r.password = null, r)));
        });
    });
    app.post("/user/add", access(5), (req, res) => {
        access(req.body.access)(req, res, () => {
            db.api.addUser(req.body, (err, rows) => {
                res.json({err, rows});
            });
        });
    });
    app.post("/user/edit", access(5), (req, res) => {
        access(req.body.access)(req, res, () => {
            db.api.editUser(req.body, (err, rows) => {
                res.json({err, rows});
            });    
        });   
    });
    app.delete("/user", access(5), (req, res) => {
        db.api.getUserById(req.query.id, (err, target) => {
            access(target.access)(req, res, () => {
                db.api.deleteUser(target.id, (err, rows) => {
                    res.json({err, rows});
                });
            });
        });
    });
}