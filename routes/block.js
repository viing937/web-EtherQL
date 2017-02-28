/* jshint node: true */
'use strict';

var Express = require('express');
var Router = Express.Router();

var DbHelper = require('../js/dbHelper.js');
var Ethereum = require('../js/ethereum.js');

/* GET home page. */
Router.get('/', function(req, res, next) {
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

    var start = parseInt(Ethereum.currentBlock) - page*pageSize;
    var end = start + pageSize;

    DbHelper.queryBlcok({number: {$gt: '0x'+start.toString(16), $lte: '0x'+end.toString(16)}}, {
        sort: {
            timestamp: -1
        }
    }, function (docs) {
        res.render('blocks', {
            title: 'blocks',
            supplies: docs
        });
    });
});

module.exports = Router;
