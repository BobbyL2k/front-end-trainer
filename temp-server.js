/* jshint node: true, esversion: 6 */
"use strict";
const express = require('express');
var app = express();

app.use(express.static('public/'));

app.all("/submit", function (req, res) {
    console.log(req);
    res.send('Hello World!');
})

app.listen(3000)
