//libs
var comment = require('../models/comment.js');

// helpers
var GeneralHelper = require('../helpers/general_helper.js');


// repo
function CommentRepo() { }
module.exports = CommentRepo;


// get a by id
CommentRepo.getById = function(id, cb) {
    comment.findById(id).exec((e, v) => cb(e, v));
}

// get a by comment
CommentRepo.getByComment = function(msg, cb) {
    var hash = GeneralHelper.getHash([ msg ]);

    var msg = {
        comment: msg,
        hash: hash
    };

    comment.findOneAndUpdate(
        { 'hash': hash },
        msg,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get a by hash
CommentRepo.getByHash = function(hash, cb) {
    if (!hash) { cb(); return; }
    comment.findOne({ 'hash': hash }, (e, v) => cb(e, v));
}
