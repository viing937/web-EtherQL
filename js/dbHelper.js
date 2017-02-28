/* jshint node: true */
'use strict';
var mongoose = require('mongoose');

var dbHelper = function () {
    var self = this;

    mongoose.connect('mongodb://localhost/ethereum');
    self.db = mongoose.connection;
    self.db.on('error', console.error.bind(console, 'Error: connection error:'));
    self.db.once('open', function () {
        console.log('mongoose opened.');
        self.statusSchema = new mongoose.Schema({
            blockNumber: {type: Number},
        }, {
            collection: "status"
        });
        self.blockSchema = new mongoose.Schema({
            difficulty: {type: String},
            extraData: {type: String},
            gasLimit: {type: String},
            gasUsed: {type: String},
            hash: {type: String, unique: true},
            logsBloom: {type: String},
            miner: {type: String},
            mixHash: {type: String},
            nonce: {type: String},
            number: {type: Number},
            parentHash: {type: String},
            receiptsRoot: {type: String},
            sha3Uncles: {type: String},
            size: {type: String},
            stateRoot: {type: String},
            timestamp: {type: Date},
            totalDifficulty: {type: String},
            transactions: {type: Array},
            transactionsRoot: {type: String},
            uncles: {type: Array}
        }, {
            collection: "blocks"
        });
    });
};

dbHelper.prototype.updateSyncStatus = function (data) {
    var self = this;

    var Status = mongoose.model('status', self.statusSchema);
    Status.remove({}, function (err, docs) {
        var status = new Status(data);
        status.save();
    });
};

dbHelper.prototype.getSyncStatus = function (callback) {
    var self = this;

    var Status = mongoose.model('status', self.statusSchema);
    Status.findOne({}, function (err, docs) {
        callback(docs);
    });
};

dbHelper.prototype.insertBlock = function (data, callback) {
    var self = this;

    var Block = mongoose.model('blocks', self.blockSchema);
    var block = new Block(data);
    block.save(function (err) {
        if (err) {
            console.error('ERROR: save block ' + JSON.stringify(data));
        }
        callback();
    });
};

dbHelper.prototype.queryBlcok = function (whereStr, fields, params, callback) {
    var self = this;
    var Block = mongoose.model('blocks', self.blockSchema);
    Block.find(whereStr, fields, params, function (err, docs) {
        if (err) {
            console.error('ERROR: query block ' + JSON.stringify(whereStr));
        }
        callback(docs);
    });
};

module.exports = new dbHelper();
