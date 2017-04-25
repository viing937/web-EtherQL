/* jshint node: true */
'use strict';

var Express = require('express');
var Router = Express.Router();

var DbHelper = require('../js/dbHelper.js');
var Ethereum = require('../js/ethereum.js');

Router.get('/', function(req, res, next) {
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 25;

    var start = Ethereum.currentBlock - page*pageSize;
    var end = start + pageSize;

    DbHelper.queryAccount({}, [
        'address', 'balance'
    ], {
        sort: {
            balance: -1 
        }
    }, function (docs) {
        res.render('accounts', {
            pageName: 'Accounts',
            accounts: (docs ? docs.slice((page-1)*pageSize, page*pageSize) : []),
            page: page,
            maxPage: Math.ceil(docs.length/pageSize)
        });
    });
});

module.exports = Router;
