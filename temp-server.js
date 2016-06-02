/* jshint node: true, esversion: 6 */
"use strict";
const express = require('express');
var app = express();

app.use(express.static('public/'));

app.get("/getframeid", function (req, res) {
    res.send("100");
});

app.all("/submit", function (req, res) {
    res.send('Hello World!');
});

app.listen(3000)
