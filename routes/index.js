/* jshint node: true */
'use strict';

var Express = require('express');
var Router = Express.Router();

var DbHelper = require('../js/dbHelper.js');

/* GET home page. */
Router.get('/', function(req, res, next) {
    DbHelper.queryBlcok({}, function (docs) {
        res.send(JSON.stringify(docs));
    });
});

module.exports = Router;
