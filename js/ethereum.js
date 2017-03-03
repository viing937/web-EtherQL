/* jshint node: true */
/* jshint esversion: 6 */
/* jshint loopfunc: true */
'use strict';

var Http = require('http');
var DbHelper = require('./dbHelper.js');
var Config = require('../etherql.cfg.json');

var ethereum = function () {
    var self = this;

    self.syncCount = 0;
    self.syncTransCount = 0;

    setTimeout(function () {
        DbHelper.getSyncStatus(function (result) {
            result = result ? result : {};
            self.currentBlock = result.blockNumber ? result.blockNumber : null;
            self.transNumber = result.transNumber ? result.transNumber : 0;
            self.syncTimer = new setInterval(self.syncStatus.bind(self), 10000);
        });
    }, 2000);
};

ethereum.prototype.syncStatus = function () {
    var self = this;

    if (self.syncCount > 0 || self.syncTransCount > 0) {
        return;
    }

    var postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params:[],
        id: 83
    });

    var options = {
        host: Config.gethHost,
        port: Config.gethPort,
        path: '/',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": postData.length
        }
    };

    var req = Http.request(options, function (res) {
        var response = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            response += chunk;
        });
        res.on('end', function () {
            var blockNumber = parseInt(JSON.parse(response).result);
            if (self.currentBlock !== blockNumber) {
                var start = self.currentBlock ? self.currentBlock+1 : 0;
                var end = blockNumber-start>500 ? start+500 : blockNumber;
                self.syncCount = end - start + 1;
                console.log('start sync from #' + start + ' to #' + end);
                for (let i = start; i <= end; i++) {
                    self.updateBlockByNumber(i, function () {
                        self.syncCount -= 1;
                        if (!self.syncCount) {
                            self.currentBlock = end;
                            DbHelper.updateSyncStatus({blockNumber: end});
                            self.syncStatus();
                        }
                    });
                }
            }
        });
    });

    req.on('error', function (e) {
        console.error('ERROR: syncStatus, ' + e.message);
    });

    req.write(postData);
    req.end();
};

ethereum.prototype.updateBlockByNumber = function (blockNumber, callback) {
    var self = this;

    var postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params:[
            "0x" + blockNumber.toString(16),
            true
        ],
        id: 1
    });

    var options = {
        host: Config.gethHost,
        port: Config.gethPort,
        path: '/',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": postData.length
        }
    };

    var req = Http.request(options, function (res) {
        var response = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            response += chunk;
        });
        res.on('end', function () {
            var block = JSON.parse(response).result;

            self.syncTransCount += block.transactions.length;

            block.number = parseInt(block.number);
            block.timestamp = new Date(parseInt(block.timestamp*1000));
            for (var i = 0; i < block.transactions.length; i++) {
                block.transactions[i].blockNumber = parseInt(block.transactions[i].blockNumber);
                block.transactions[i].transactionIndex = parseInt(block.transactions[i].transactionIndex);
                DbHelper.insertTransaction(block.transactions[i], function () {
                    self.syncTransCount -= 1;
                    if (!self.syncTransCount) {
                        self.transNumber += block.transactions.length;
                        DbHelper.updateSyncStatus({transNumber: self.transNumber});
                    }
                });
            }
            DbHelper.insertBlock(block, callback);
        });
    });

    req.on('error', function (e) {
        console.error('ERROR: updateBlockByNumber ' + blockNumber + ', ' + e.message + ', retry');
        self.updateBlockByNumber(blockNumber, callback);
    });

    req.write(postData);
    req.end();
};

module.exports = new ethereum();
