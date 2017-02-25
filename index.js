/* jshint node: true */
'use strict';
var path = require('path');
var express = require('express');

var ethereum = require('./ethereum.js');
var index = require('./routes/index');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('./www'));

app.use('/', index);

var syncTimer = setInterval(function () {
    ethereum.syncStatus();
}, 1000);

app.listen(3000);
