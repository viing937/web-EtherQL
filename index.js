/* jshint node: true */
'use strict';
var Path = require('path');
var Express = require('express');
var Helpers = require('express-helpers');

var ethereum = require('./js/ethereum.js');
var index = require('./routes/index.js');
var block = require('./routes/block.js');
var transaction = require('./routes/transaction.js');

var app = Express();
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(Express.static(Path.join(__dirname, 'public')));

Helpers(app);

app.use('/', index);
app.use('/block', block);
app.use('/transaction', transaction);

app.listen(3000);
