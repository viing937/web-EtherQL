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

    var start = Ethereum.transNumber - page*pageSize;
    var end = start + pageSize;

    DbHelper.queryTransaction({number: {$gt: start, $lte: end}}, [
        'hash', 'blockNumber', 'from', 'to'
    ], {
        sort: {
            number: -1
        }
    }, function (docs) {
        res.render('transactions', {
            pageName: 'Transactions',
            transactions: (docs ? docs : []),
            page: page,
            maxPage: Math.ceil(Ethereum.transNumber/pageSize)
        });
    });
});

Router.get('/:hash', function(req, res, next) {
    var hash = req.params.hash;
    if (!hash) {
        res.redirect('/transaction');
        return;
    }

    DbHelper.queryTransaction({hash: hash}, [
        'hash', 'blockNumber', 'from', 'to', 'value', 'nonce', 'gasPrice', 'gas'
    ], {
    }, function (docs) {
        if (docs.length > 0) {
            res.render('transactionDetail', {
                pageName: 'TransactionDetail',
                transaction: docs[0]
            });
        } else {
            res.redirect('/transaction');
        }
    });
});

module.exports = Router;
