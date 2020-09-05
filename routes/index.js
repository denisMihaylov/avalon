const express = require('express');

const router = express.Router();

const app = require('../app.js');


// app.requireLogin(req);
router.get("/", function(req, res) {
    res.sendFile("index.html", { root: "./static" });
});

module.exports = router;