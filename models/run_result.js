// libs
var moment = require('moment');
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;
var enums = require('../tools/enums.js');


// create schema
var schema = new monSchema({
    run: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Run'
    },
    result: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Result'
    },
    state: {
        type: String,
        required: true,
        index: true,
        default: enums.Result[0],
        enum: enums.Result
    },
    comment: {
        type: monSchema.Types.ObjectId,
        ref: 'Comment'
    },
    duration: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    created_at: {
        type: Date,
        default: null
    },
    updated_at: {
        type: Date,
        default: null
    },
    is_fixed: {
        type: Boolean,
        default: false
    }
});


// returns results history paginated
schema.statics.getPaginatedResultsHistory = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "results",
                "localField": "result",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$lookup": {
                "from": "comments",
                "localField": "comment",
                "foreignField": "_id",
                "as": "comment"
            }
        },
        {
            "$lookup": {
                "from": "runs",
                "localField": "run",
                "foreignField": "_id",
                "as": "run"
            }
        },
        {
            "$unwind": "$result"
        },
        {
            "$unwind": "$run"
        },
        {
            "$unwind": { path: "$comment", preserveNullAndEmptyArrays: true }
        },
        {
            "$lookup": {
                "from": "tests",
                "localField": "result.test",
                "foreignField": "_id",
                "as": "result.test"
            }
        },
        {
            "$lookup": {
                "from": "errormessages",
                "localField": "result.error_message",
                "foreignField": "_id",
                "as": "result.error_message"
            }
        },
        {
            "$lookup": {
                "from": "stacktraces",
                "localField": "result.stack_trace",
                "foreignField": "_id",
                "as": "result.stack_trace"
            }
        },
        {
            "$unwind": "$result.test"
        },
        {
            "$unwind": { path: "$result.error_message", preserveNullAndEmptyArrays: true }
        },
        {
            "$unwind": { path: "$result.stack_trace", preserveNullAndEmptyArrays: true }
        },
        {
            "$lookup": {
                "from": "projects",
                "localField": "run.project",
                "foreignField": "_id",
                "as": "run.project"
            }
        },
        {
            "$lookup": {
                "from": "computers",
                "localField": "run.computer",
                "foreignField": "_id",
                "as": "run.computer"
            }
        },
        {
            "$lookup": {
                "from": "groups",
                "localField": "run.group",
                "foreignField": "_id",
                "as": "run.group"
            }
        },
        {
            "$unwind": "$run.project"
        },
        {
            "$unwind": "$run.computer"
        },
        {
            "$unwind": { path: "$run.group", preserveNullAndEmptyArrays: true }
        },
        {
            "$match": opt.query
        },
        {
            "$sort": { created_at: -1 }
        },
        {
            "$skip": ((opt.page - 1) * opt.limit)
        },
        {
            "$limit": opt.limit
        }
    ],
    (e, r) => cb(e, r));
}


// returns results paginated
schema.statics.getPaginatedResults = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "results",
                "localField": "result",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$lookup": {
                "from": "comments",
                "localField": "comment",
                "foreignField": "_id",
                "as": "comment"
            }
        },
        {
            "$unwind": "$result"
        },
        {
            "$unwind": { path: "$comment", preserveNullAndEmptyArrays: true }
        },
        {
            "$lookup": {
                "from": "tests",
                "localField": "result.test",
                "foreignField": "_id",
                "as": "result.test"
            }
        },
        {
            "$lookup": {
                "from": "errormessages",
                "localField": "result.error_message",
                "foreignField": "_id",
                "as": "result.error_message"
            }
        },
        {
            "$lookup": {
                "from": "stacktraces",
                "localField": "result.stack_trace",
                "foreignField": "_id",
                "as": "result.stack_trace"
            }
        },
        {
            "$unwind": "$result.test"
        },
        {
            "$unwind": { path: "$result.error_message", preserveNullAndEmptyArrays: true }
        },
        {
            "$unwind": { path: "$result.stack_trace", preserveNullAndEmptyArrays: true }
        },
        {
            "$match": opt.query
        },
        {
            "$sort": { created_at: -1 }
        },
        {
            "$skip": ((opt.page - 1) * opt.limit)
        },
        {
            "$limit": opt.limit
        }
    ],
    (e, r) => cb(e, r));
}


// returns the errors that have occurred for a specific run
schema.statics.getErrors = function(opt, cb) {
    this.aggregate([
        {
            "$match": opt.query
        },
        {
            "$lookup": {
                "from": "results",
                "localField": "result",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$unwind": "$result"
        },
        {
            "$match": { 'result.error_message': { $ne: null } }
        },
        {
            "$group": {
                '_id': "$result.error_message",
                'count': { $sum:  1 }
            }
        },
        {
            "$lookup": {
                "from": "errormessages",
                "localField": "_id",
                "foreignField": "_id",
                "as": "error_message"
            }
        },
        {
            "$unwind": "$error_message"
        },
    ],
    (e, r) => cb(e, r));
}


// returns all results (useful for csv download)
schema.statics.getAllResults = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "results",
                "localField": "result",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$lookup": {
                "from": "comments",
                "localField": "comment",
                "foreignField": "_id",
                "as": "comment"
            }
        },
        {
            "$unwind": "$result"
        },
        {
            "$unwind": { path: "$comment", preserveNullAndEmptyArrays: true }
        },
        {
            "$lookup": {
                "from": "tests",
                "localField": "result.test",
                "foreignField": "_id",
                "as": "result.test"
            }
        },
        {
            "$lookup": {
                "from": "errormessages",
                "localField": "result.error_message",
                "foreignField": "_id",
                "as": "result.error_message"
            }
        },
        {
            "$lookup": {
                "from": "stacktraces",
                "localField": "result.stack_trace",
                "foreignField": "_id",
                "as": "result.stack_trace"
            }
        },
        {
            "$unwind": "$result.test"
        },
        {
            "$unwind": { path: "$result.error_message", preserveNullAndEmptyArrays: true }
        },
        {
            "$unwind": { path: "$result.stack_trace", preserveNullAndEmptyArrays: true }
        },
        {
            "$match": opt.query
        },
        {
            "$sort": { created_at: -1 }
        }
    ],
    (e, r) => cb(e, r));
}


// returns a count of results
schema.statics.getCount = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "runs",
                "localField": "run",
                "foreignField": "_id",
                "as": "run"
            }
        },
        {
            "$lookup": {
                "from": "results",
                "localField": "result",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$unwind": "$run"
        },
        {
            "$unwind": "$result"
        },
        {
            "$lookup": {
                "from": "tests",
                "localField": "result.test",
                "foreignField": "_id",
                "as": "result.test"
            }
        },
        {
            "$unwind": "$result.test"
        },
        {
            "$lookup": {
                "from": "projects",
                "localField": "run.project",
                "foreignField": "_id",
                "as": "run.project"
            }
        },
        {
            "$lookup": {
                "from": "computers",
                "localField": "run.computer",
                "foreignField": "_id",
                "as": "run.computer"
            }
        },
        {
            "$lookup": {
                "from": "groups",
                "localField": "run.group",
                "foreignField": "_id",
                "as": "run.group"
            }
        },
        {
            "$unwind": "$run.project"
        },
        {
            "$unwind": "$run.computer"
        },
        {
            "$unwind": { path: "$run.group", preserveNullAndEmptyArrays: true }
        },
        {
            "$match": opt.query
        },
        {
            "$count": "count"
        }
    ],
    (e, r) => {
        if (e) { cb(e); return; }
        cb(null, (r.length == 0 ? 0 : r[0].count))
    });
}


// returns the slowest results
schema.statics.getSlowestResults = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "runs",
                "localField": "run",
                "foreignField": "_id",
                "as": "run"
            }
        },
        {
            "$lookup": {
                "from": "results",
                "localField": "result",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$unwind": "$result"
        },
        {
            "$lookup": {
                "from": "tests",
                "localField": "result.test",
                "foreignField": "_id",
                "as": "result.test"
            }
        },
        {
            "$unwind": "$run"
        },
        {
            "$unwind": "$result.test"
        },
        {
            "$match": opt.query
        },
        {
            "$sort": { duration: -1 }
        },
        {
            "$limit": opt.limit
        }
    ],
    (e, r) => cb(e, r));
}


// returns the top failing results
schema.statics.getTopFailingResults = function(opt, cb) {
    this.aggregate([
        {
            "$match": { state: { $ne: enums.Result[1] } }
        },
        {
            "$lookup": {
                "from": "runs",
                "localField": "run",
                "foreignField": "_id",
                "as": "run"
            }
        },
        {
            "$unwind": "$run"
        },
        {
            "$match": opt.query
        },
        {
            "$group": {
                _id: "$result",
                count: { $sum: 1 }
            }
        },
        {
            "$lookup": {
                "from": "results",
                "localField": "_id",
                "foreignField": "_id",
                "as": "result"
            }
        },
        {
            "$unwind": "$result"
        },
        {
            "$lookup": {
                "from": "tests",
                "localField": "result.test",
                "foreignField": "_id",
                "as": "result.test"
            }
        },
        {
            "$unwind": "$result.test"
        },
        {
            "$sort": { count: -1 }
        },
        {
            "$limit": opt.limit
        },
        {
            "$project": {
                "result.test.name": 1,
                "result.test.namespace": 1,
                "result.test.assembly": 1,
                "count": 1
            }
        }
    ],
    (e, r) => cb(e, r));
}


// pre-save setter
schema.pre('save', function(next) {
    var now = moment.utc();

    // initial setting of create date
    if (!this.created_at) {
        this.created_at = now;
    }

    // set updated date
    this.updated_at = now;
    next();
});

schema.pre('findOneAndUpdate', function(next) {
    var now = moment.utc();

    // initial setting of create date
    if (!this._update.created_at) {
        this._update.created_at = now;
    }

    // set updated date
    this._update.updated_at = now;
    next();
})


// save model
module.exports = mongoose.model('RunResult', schema);