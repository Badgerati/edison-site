// libs
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;
var config = require('../config.js');


// create schema
var schema = new monSchema({
    name: {
        type: String,
        required: false,
        index: true,
        maxlength: config.validation.testname.max
    },
    namespace: {
        type: String,
        required: false,
        index: false,
        maxlength: config.validation.namespace.max
    },
    assembly: {
        type: String,
        required: false,
        index: false,
        maxlength: config.validation.assembly.max
    },
    hash: {
        type: String,
        required: true,
        unique: true,
        index: true,
        maxlength: config.validation.hashes.max
    }
});


// returns the first testId for a search term
schema.statics.searchForTest = function(opt, cb) {
    this.aggregate([
        {
            "$match": opt.query
        },
        {
            "$limit": 1
        }
    ],
    (e, r) => cb(e, r));
}


// save model
module.exports = mongoose.model('Test', schema);