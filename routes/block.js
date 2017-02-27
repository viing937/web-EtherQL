/* jshint node: true */
'use strict';

var Express = require('express');
var Router = Express.Router();

var DbHelper = require('../js/dbHelper.js');

/* GET home page. */
Router.get('/', function(req, res, next) {
    var page = req.query.page ? parseInt(req.query.page) : 0;
    var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    DbHelper.queryBlcok({}, {
        skip: pageSize * page,
        limit: pageSize,
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
