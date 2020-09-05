const express = require('express');
const routes = require('./routes/index');

const app = express();
app.use('/', routes);
app.use('/static', express.static('static'))

module.exports = app;