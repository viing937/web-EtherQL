/* jshint node: true */
'use strict';

var Express = require('express');
var Router = Express.Router();

var DbHelper = require('../js/dbHelper.js');
var Ethereum = require('../js/ethereum.js');

/* GET home page. */
Router.get('/', function(req, res, next) {
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 25;

    var start = parseInt(Ethereum.currentBlock) - page*pageSize;
    var end = start + pageSize;

    DbHelper.queryBlcok({number: {$gt: start, $lte: end}}, [
        'number', 'hash', 'difficulty', 'miner', 'gasUsed', 'timestamp', 'transactions', 'uncles'
    ], {
        sort: {
            timestamp: -1
        }
    }, function (docs) {
        res.render('blocks', {
            blocks: (docs ? docs : [])
        });
    });
});

module.exports = Router;
