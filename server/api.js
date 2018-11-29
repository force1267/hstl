const passport = require('passport');

module.exports = ({app, db}) => {
    app.get("/ping", (req, res) => {
        console.log(req.user.username, "pinged !");
        return res.end("pong " + (req.user ? req.user.firstname : "stranger"));
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

    app.get('/app', (req, res) => {
        if(!req.user) return res.redirect("/login");
        console.log(req.user.username, "logged in !");
        return res.sendFile("index.html", { root: __dirname + "/../www/" });
    });

    // real api :

    // patients :
    app.get("/pat", (req, res) => {});

    // users :
    app.get("/user", (req, res) => {});
}