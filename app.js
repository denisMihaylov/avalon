const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const uuid = require('uuid')
const routes = require('./routes/index');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const users = [
    { id: 'denis', email: 'denis@gmail.com', password: '$2a$10$.niYNiRCz524NgxElJKM6eC7Rx3Qn/6/lUp4jP6onqupyfckTB0I6' }
]

passport.use(new LocalStrategy({ usernameField: 'email' },
    (email, password, done) => {
        // TODO: Call the database and find the user by email. Then check the password
        const user = users[0]
        if (email === user.email && bcrypt.compareSync(password, user.password)) {
            return done(null, user)
        } else {
            done(new Error("Username or password are incorrect!"));
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

app.get('/login', (req, res) => {
    console.log('Inside GET /login callback function')
    console.log(req.sessionID)
    res.json({ isAuthenticated: req.isAuthenticated() })
})

app.post('/login', (req, res, next) => {
    console.log('Inside POST /login callback')
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.login(user, (err) => {
            if (err) { return next(err); }
            res.status(200).end()
        })
    })(req, res, next);
})

function requireLogin(req) {
    if (!req.isAuthenticated()) {
        throw new Error("Not Authenticated!");
    }
}

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send(err.message)
})

app.use('/', routes);
app.use('/static', express.static('static'));

module.exports = app;