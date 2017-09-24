//libs
var error_message = require('../models/error_message.js');

// helpers
var GeneralHelper = require('../helpers/general_helper.js');


// repo
function ErrorMessageRepo() { }
module.exports = ErrorMessageRepo;


// get a by id
ErrorMessageRepo.getById = function(id, cb) {
    error_message.findById(id).exec((e, v) => cb(e, v));
}

// get a by message or create the message
ErrorMessageRepo.getByMessage = function(message, cb) {
    var hash = GeneralHelper.getHash([ message ]);

    var msg = {
        message: message,
        hash: hash
    };

    error_message.findOneAndUpdate(
        { 'hash': hash },
        msg,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get a by hash
ErrorMessageRepo.getByHash = function(hash, cb) {
    if (!hash) { cb(); return; }
    error_message.findOne({ 'hash': hash }, (e, v) => cb(e, v));
}
