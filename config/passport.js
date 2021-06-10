const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

require("dotenv").config();
const User = require("../models/user");

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["token"];
    }
    return token;
};

const jwtOptions = {
    secretOrKey: process.env.SECRETKEY || "heheboiz",
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
};

const strategy = new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    User
        .findOne({
            _id: jwt_payload.id
        })
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => done(err, null));
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = (passport) => {
    passport.use(strategy);
};
