/* jshint node: true */
'use strict';
var Path = require('path');
var Express = require('express');

var ethereum = new require('./js/ethereum.js')();
var index = require('./routes/index');

var app = Express();
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', index);

app.listen(3000);
