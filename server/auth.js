const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

module.exports = ({app, db}) => {

    passport.use(new LocalStrategy(db.api.getUserByUserPass));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(db.api.getUserById);
    
    app.use(passport.initialize());
    app.use(passport.session());
}