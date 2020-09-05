const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const uuid = require('uuid')
const routes = require('./routes/index');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const { NULL } = require('node-sass');
const LocalStrategy = require('passport-local').Strategy;

const users = [
    { id: 'denis', email: 'denis@gmail.com', password: 'password' }
]

passport.use(new LocalStrategy({ usernameField: 'email' },
    (email, password, done) => {
        console.log('Inside local strategy callback');
        // TODO: Call the database and find the user by email. Then check the password
        const user = users[0]
        if (email === user.email && password === user.password) {
            console.log('Local strategy returned true')
            return done(null, user)
        } else {
            console.log("Failed Authentication");
        }
    }
));

passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here')
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log('Inside deserializeUser callback')
    console.log(`The user id passport saved in the session file store is: ${id}`)
    const user = users[0].id === id ? users[0] : false;
    done(null, user);
});

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

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    console.log('Inside the homepage callback function')
    console.log(req.sessionID)
    res.send(`You hit home page!\n`)
});

app.get('/login', (req, res) => {
    console.log('Inside GET /login callback function')
    console.log(req.sessionID)
    res.json({ isAuthenticated: req.isAuthenticated() })
})

app.post('/login', (req, res, next) => {
    console.log('Inside POST /login callback')
    passport.authenticate('local', (err, user, info) => {
        if (err != null) {
            console.log(err);
        }
        console.log('Inside passport.authenticate() callback');
        console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        console.log(`req.user: ${JSON.stringify(req.user)}`)
        req.login(user, (err) => {
            if (err != null) {
                console.log(err)
            }
            console.log('Inside req.login() callback')
            console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
            console.log(`req.user: ${JSON.stringify(req.user)}`)
            return res.send('You were authenticated & logged in!\n');
        })
    })(req, res, next);
})

app.get('/authrequired', (req, res) => {
    console.log('Inside GET /authrequired callback')
    console.log(`User authenticated? ${req.isAuthenticated()}`)
    if (req.isAuthenticated()) {
        res.send('you hit the authentication endpoint\n')
    } else {
        res.status(403).send({
            message: 'Not Authenticated!'
        })
    }
})

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// app.use('/', routes);
// app.use('/static', express.static('static'));

module.exports = app;