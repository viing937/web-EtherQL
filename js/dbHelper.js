/* jshint node: true */
'use strict';
var MongoClient = require('mongodb').MongoClient;

var CONSTR = 'mongodb://localhost:27017/ethereum';

var dbHelper = function () {
    if(!(this instanceof dbHelper)) {
        console.log('db.js init');
        var instance = new dbHelper();
        return instance;
    }
    return this;
};

dbHelper.prototype.updateSyncStatus = function (data) {
    MongoClient.connect(CONSTR, function (err, db) {
        var collection = db.collection('status');
        collection.update({}, {$set: data}, function (err, result) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }
            if (!result.result.n) {
                collection.insert(data, function (err, result) {
                    if (err) {
                        console.log('Error: ' + err);
                        return;
                    }
                    db.close();
                });
            } else {
                db.close();
            }
        });
    });
};

dbHelper.prototype.getSyncStatus = function (callback) {
    MongoClient.connect(CONSTR, function (err, db) {
        var collection = db.collection('status');
        collection.findOne({}, function(err, result) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }
            callback(result);
            db.close();
        });
    });
};

dbHelper.prototype.insertBlock = function (data, callback) {
    MongoClient.connect(CONSTR, function (err, db) {
        var collection = db.collection('blocks');
        collection.insert(data, function(err, result) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }
            callback();
            db.close();
        });
    });
};

module.exports = dbHelper;
