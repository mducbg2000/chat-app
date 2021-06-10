const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
require('./socket-server')(io)
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./config/db');
require('./config/passport')(passport);
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, '/public')))
app.use(morgan('dev'));
app.use(cookieParser());

app.use(passport.initialize());


app.use('/login', require('./routers/login'));
app.use('/register', require('./routers/register'));
app.use('/', passport.authenticate("jwt", {
    session: true,
    failureRedirect: '/login'
}), require('./routers/router'));


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('If-Modified-Since', (new Date()).toUTCString());
    next();
})

server.listen(process.env.PORT, () =>
    console.log(`Server running at http://localhost:${process.env.PORT}/home`))
