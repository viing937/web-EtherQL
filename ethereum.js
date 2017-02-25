/* jshint node: true */
'use strict';
var http = require('http');

var ethereum = {};

ethereum.syncStatus = function () {
    var self = this;

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

    var req = http.request(options, function (res) {
        var response = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            response += chunk;
        });
        res.on('end', function () {
            var currentBlock = parseInt(JSON.parse(response).result.currentBlock, 16);
            if (self.currentBlock != currentBlock) {
                self.currentBlock = currentBlock;
                // self.syncRecentTransaction();
            }
        });
    });

    req.on('error', function (e) {
    });

    req.write(postData);
    req.end();
};

module.exports = ethereum;
