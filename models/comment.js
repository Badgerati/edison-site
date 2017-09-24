// libs
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;
var config = require('../config.js');

// helpers
var GeneralHelper = require('../helpers/general_helper.js');


// create schema
var schema = new monSchema({
    comment: {
        type: String,
        required: false,
        index: false,
        maxlength: config.validation.comment.max
    },
    hash: {
        type: String,
        required: true,
        unique: true,
        index: true,
        maxlength: config.validation.hashes.max
    }
});


// save model
module.exports = mongoose.model('Comment', schema);