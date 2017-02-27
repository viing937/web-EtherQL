/* jshint node: true */
/* jshint esversion: 6 */
/* jshint loopfunc: true */
'use strict';

var Http = require('http');
var DbHelper = new require('./dbHelper.js')();

var ethereum = function () {
    if(!(this instanceof ethereum)) {
        var instance = new ethereum();
        setTimeout(function () {
            DbHelper.getSyncStatus(function (result) {
                if (result) {
                    instance.currentBlock = result.currentBlock;
                } else {
                    instance.currentBlock = null;
                }
                instance.syncTimer = new setInterval(instance.syncStatus.bind(instance), 10000);
            });
        }, 2000);
        return instance;
    }
    return this;
};

ethereum.prototype.syncStatus = function () {
    var self = this;

    if (self.syncCount > 0) {
        return;
    }

    var postData = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_syncing",
        params:[],
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
            var syncStatus = JSON.parse(response).result;
            if (self.currentBlock !== syncStatus.currentBlock) {
                var start = self.currentBlock ? parseInt(self.currentBlock)+1 : 0;
                var end = parseInt(syncStatus.currentBlock);
                if (end - start > 500) {
                    end = start + 500;
                }
                self.syncCount = end - start + 1;
                console.log('start sync from #' + start + ' to #' + end);
                for (let i = start; i <= end; i++) {
                    self.updateBlock(i, function () {
                        self.syncCount -= 1;
                        if (!self.syncCount) {
                            self.currentBlock = syncStatus.currentBlock = '0x'+end.toString(16);
                            DbHelper.updateSyncStatus(syncStatus);
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
            DbHelper.insertBlock(block, callback);
        });
    });

    req.on('error', function (e) {
        console.log('ERROR: updateBlock ' + blockNumber);
        self.updateBlock(blockNumber, callback);
    });

    req.write(postData);
    req.end();
};

module.exports = ethereum;
