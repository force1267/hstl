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
    app.get("/search", private, (req, res) => {
        console.log(req.query);
        res.json({
            google: null,
            microsoft: null,
            apple: null
        })
    });
    // patients :
    app.get("/pat", (req, res) => {
        res.end("what ?!")
    });

    // users :
    app.get("/user", (req, res) => {});
}