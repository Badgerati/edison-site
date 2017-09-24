// libs
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;
var config = require('../config.js');


// create schema
var schema = new monSchema({
    message: {
        type: String,
        required: false,
        index: false,
        maxlength: config.validation.errormessage.max
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
module.exports = mongoose.model('ErrorMessage', schema);