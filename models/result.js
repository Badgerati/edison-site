// libs
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;


// create schema
var schema = new monSchema({
    test: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Test'
    },
    error_message: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'ErrorMessage'
    },
    stack_trace: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'StackTrace'
    }
});


// save model
module.exports = mongoose.model('Result', schema);