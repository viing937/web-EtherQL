/* jshint node: true */
'use strict';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ethereum');

var dbHelper = function () {
    if(!(this instanceof dbHelper)) {
        var instance = new dbHelper();
        instance.db = mongoose.connection;
        instance.db.on('error', console.error.bind(console, 'connection error:'));
        instance.db.once('open', function () {
            console.log('mongoose opened.');
            instance.statusSchema = new mongoose.Schema({
                currentBlock: {type: String},
                highestBlock: {type: String},
                knownStates: {type: String},
                pulledStates: {ype: String},
                startingBlock: {type: String}
            }, {
                collection: "status"
            });
            instance.blockSchema = new mongoose.Schema({
                difficulty: {type: String},
                extraData: {type: String},
                gasLimit: {type: String},
                gasUsed: {type: String},
                hash: {type: String, unique: true},
                logsBloom: {type: String},
                miner: {type: String},
                mixHash: {type: String},
                nonce: {type: String},
                number: {type: String},
                parentHash: {type: String},
                receiptsRoot: {type: String},
                sha3Uncles: {type: String},
                size: {type: String},
                stateRoot: {type: String},
                timestamp: {type: String},
                totalDifficulty: {type: String},
                transactions: {type: Array},
                transactionsRoot: {type: String},
                uncles: {type: Array}
            }, {
                collection: "blocks"
            });
        });
        return instance;
    }
    return this;
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
            console.log('ERROR: save blcok ' + JSON.stringify(data));
        }
        callback();
    });
};

module.exports = dbHelper;
