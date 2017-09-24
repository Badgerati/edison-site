//libs
var result = require('../models/result.js');


// repo
function ResultRepo() { }
module.exports = ResultRepo;


// get a by id
ResultRepo.getById = function(id, cb) {
    result.findById(id).exec((e, v) => cb(e, v));
}

// get a by details
ResultRepo.getByDetails = function(test, errorMessage, stackTrace, cb) {
    var rslt = {
        test: test._id,
        error_message: errorMessage._id,
        stack_trace: stackTrace._id
    };

    result.findOneAndUpdate(
        {
            'test': rslt.test,
            'error_message': rslt.error_message,
            'stack_trace': rslt.stack_trace
        },
        rslt,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}
