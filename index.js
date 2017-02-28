/* jshint node: true */
'use strict';
var Path = require('path');
var Express = require('express');

var ethereum = require('./js/ethereum.js');
var index = require('./routes/index.js');
var block = require('./routes/block.js');

var app = Express();
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(Express.static(Path.join(__dirname, 'public')));

app.use('/', index);
app.use('/block', block);

app.listen(3000);
