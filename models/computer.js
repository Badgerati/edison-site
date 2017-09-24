// libs
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;
var config = require('../config.js');


// create schema
var schema = new monSchema({
    name: {
        type: String,
        required: false,
        unique: true,
        index: true,
        maxlength: config.validation.names.max
    }
});


// save model
module.exports = mongoose.model('Computer', schema);