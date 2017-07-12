/* jshint node: true */
'use strict';
var mongoose = require('mongoose');
var config = require('../etherql.cfg.json');

var dbHelper = function () {
    var self = this;

    mongoose.connect(config.mongo, {
        useMongoClient: true
    });
    self.db = mongoose.connection;
    self.db.on('error', console.error.bind(console, 'Error: connection error:'));
    self.db.once('open', function () {
        console.log('mongoose opened.');

        self.statusSchema = new mongoose.Schema({
            blockNumber: {type: Number},
            transNumber: {type: Number}
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

        self.transactionSchema = new mongoose.Schema({
            number: {type: Number},
            blockHash: {type: String},
            blockNumber: {type: Number},
            from: {type: String},
            gas: {type: String},
            gasPrice: {type: String},
            hash: {type: String, unique: true},
            input: {type: String},
            nonce: {type: String},
            to: {type: String},
            transactionIndex: {type: Number},
            value: {type: String},
            v: {type: String},
            r: {type: String},
            s: {type: String}
        }, {
            collection: "transactions"
        });

        self.accountSchema = new mongoose.Schema({
            address: {type: String, unique: true},
            balance: {type: Number}
        }, {
            collection: "accounts"
        });

    });
};

dbHelper.prototype.updateSyncStatus = function (data) {
    var self = this;

    var Status = mongoose.model('status', self.statusSchema);
    Status.update({}, {$set: data}, function (err, num) {
        if (!num.n) {
            var status = new Status(data);
            status.save();
        }
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

dbHelper.prototype.insertTransaction = function (data, callback) {
    var self = this;

    var Transaction = mongoose.model('transactions', self.transactionSchema);
    var transaction = new Transaction(data);
    transaction.save(function (err) {
        if (err) {
            console.error('ERROR: save transaction ' + JSON.stringify(data));
        }
        callback();
    });
};

dbHelper.prototype.queryTransaction = function (whereStr, fields, params, callback) {
    var self = this;
    var Transaction = mongoose.model('transactions', self.transactionSchema);
    Transaction.find(whereStr, fields, params, function (err, docs) {
        if (err) {
            console.error('ERROR: query transaction ' + JSON.stringify(whereStr));
        }
        callback(docs);
    });
};

dbHelper.prototype.updateAccount = function (data, callback) {
    var self = this;

    var Account = mongoose.model('accounts', self.accountSchema);
    Account.update({address: data.address}, {$set: data}, function (err, num) {
        if (!num.n) {
            var account = new Account(data);
            account.save();
        }
        callback();
    });
};

dbHelper.prototype.queryAccount = function (whereStr, fields, params, callback) {
    var self = this;

    var Account = mongoose.model('accounts', self.accountSchema);
    Account.find(whereStr, fields, params, function (err, docs) {
        if (err) {
            console.error('ERROR: query transaction ' + JSON.stringify(whereStr));
        }
        callback(docs);
    });
};

module.exports = new dbHelper();
