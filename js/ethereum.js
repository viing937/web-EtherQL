/* jshint node: true */
/* jshint esversion: 6 */
/* jshint loopfunc: true */
'use strict';

var Http = require('http');
var DbHelper = require('./dbHelper.js');

var ethereum = function () {
    var self = this;

    setTimeout(function () {
        DbHelper.getSyncStatus(function (result) {
            if (result) {
                self.currentBlock = result.currentBlock;
            } else {
                self.currentBlock = null;
            }
            self.syncTimer = new setInterval(self.syncStatus.bind(self), 10000);
        });
    }, 2000);
};

ethereum.prototype.syncStatus = function () {
    var self = this;

    if (self.syncCount > 0) {
        return;
    }

    var postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params:[],
        id: 83
    });

    var options = {
        host: 'localhost',
        port: 8545,
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
                    self.updateBlock(i, function () {
                        self.syncCount -= 1;
                        if (!self.syncCount) {
                            var blockStatus = {};
                            self.currentBlock = blockStatus.blockNumber = end;
                            DbHelper.updateSyncStatus(blockStatus);
                            self.syncStatus();
                        }
                    });
                }
            }
        });
    });

    req.on('error', function (e) {
    });

    req.write(postData);
    req.end();
};

ethereum.prototype.updateBlock = function (blockNumber, callback) {
    var self = this;

    var postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params:[
            "0x" + blockNumber.toString(16),
            false
        ],
        id: 1
    });

    var options = {
        host: 'localhost',
        port: 8545,
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
            block.number = parseInt(block.number);
            block.timestamp = new Date(parseInt(block.timestamp*1000));
            DbHelper.insertBlock(block, callback);
        });
    });

    req.on('error', function (e) {
        console.error('ERROR: updateBlock ' + blockNumber + ', retry');
        self.updateBlock(blockNumber, callback);
    });

    req.write(postData);
    req.end();
};

module.exports = new ethereum();
