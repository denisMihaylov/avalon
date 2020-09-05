const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const uuid = require('uuid')
const routes = require('./routes/index');
const FileStore = require('session-file-store')(session);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser());

app.use(session({
    genid: uuid.v4,
    secret: 'keyboard cat',
    resave: false,
    store: new FileStore(),
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    console.log('Inside the homepage callback function')
    console.log(req.sessionID)
    res.send(`You hit home page!\n`)
});
// app.use('/', routes);
// app.use('/static', express.static('static'));

module.exports = app;