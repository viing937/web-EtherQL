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

    var start = Ethereum.currentBlock - page*pageSize;
    var end = start + pageSize;

    DbHelper.queryBlcok({number: {$gt: start, $lte: end}}, [
        'number', 'hash', 'difficulty', 'miner', 'gasUsed', 'timestamp', 'transactions', 'uncles'
    ], {
        sort: {
            number: -1
        }
    }, function (docs) {
        res.render('blocks', {
            pageName: 'Blocks',
            blocks: (docs ? docs : []),
            page: page,
            maxPage: Math.ceil(Ethereum.currentBlock/pageSize)
        });
    });
});

Router.get('/:number', function(req, res, next) {
    var number = parseInt(req.params.number);
    if (!number) {
        res.redirect('/block');
        return;
    }

    DbHelper.queryBlcok({number: number}, [
        'number', 'hash', 'difficulty', 'miner', 'gasLimit', 'gasUsed', 'timestamp', 'sha3Uncles', 'stateRoot', 'transactionsRoot', 'size', 'nonce', 'transactions', 'uncles'
    ], {
    }, function (docs) {
        if (docs.length > 0) {
            res.render('blockDetail', {
                pageName: 'BlockDetail',
                block: docs[0]
            });
        } else {
            res.redirect('/block');
        }
    });
});

module.exports = Router;
