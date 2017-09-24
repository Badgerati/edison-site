//libs
var stacktrace = require('../models/stack_trace.js');

// helpers
var GeneralHelper = require('../helpers/general_helper.js');


// repo
function StackTraceRepo() { }
module.exports = StackTraceRepo;


// get a by id
StackTraceRepo.getById = function(id, cb) {
    stacktrace.findById(id).exec((e, v) => cb(e, v));
}

// get a by trace
StackTraceRepo.getByTrace = function(trace, cb) {
    var hash = GeneralHelper.getHash([ trace ]);

    var stack = {
        stacktrace: trace,
        hash: hash
    };

    stacktrace.findOneAndUpdate(
        { 'hash': hash },
        stack,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get a by hash
StackTraceRepo.getByHash = function(hash, cb) {
    if (!hash) { cb(); return; }
    stacktrace.findOne({ 'hash': hash }, (e, v) => cb(e, v));
}
