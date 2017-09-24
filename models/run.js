// libs
var moment = require('moment');
var mongoose = require('mongoose');
var monSchema = mongoose.Schema;
var config = require('../config.js');


// create schema
var schema = new monSchema({
    name: {
        type: String,
        required: true,
        index: true,
        maxlength: config.validation.names.max
    },
    project: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Project'
    },
    computer: {
        type: monSchema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Computer'
    },
    group: {
        type: monSchema.Types.ObjectId,
        required: false,
        index: true,
        ref: 'Group'
    },
    stats: {
        total_count: {
            type: Number,
            default: 0,
            min: 0
        },
        pass_count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    created_at: {
        type: Date,
        default: null
    },
    updated_at: {
        type: Date,
        default: null
    },
    ended_at: {
        type: Date,
        default: null
    },
    has_finished: {
        type: Boolean,
        default: false
    }
});


// lookup function to filter by project, computer, group, etc
schema.statics.lookup = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "projects",
                "localField": "project",
                "foreignField": "_id",
                "as": "project"
            }
        },
        {
            "$lookup": {
                "from": "computers",
                "localField": "computer",
                "foreignField": "_id",
                "as": "computer"
            }
        },
        {
            "$lookup": {
                "from": "groups",
                "localField": "group",
                "foreignField": "_id",
                "as": "group"
            }
        },
        {
            "$unwind": "$project"
        },
        {
            "$unwind": "$computer"
        },
        {
            "$unwind": { path: "$group", preserveNullAndEmptyArrays: true }
        },
        {
            "$match": opt.query
        },
        {
            "$sort": opt.sort
        },
        {
            "$limit": opt.limit
        }
    ],
    (e, r) => cb(e, r));
}


// returns runs paginated
schema.statics.getPaginatedRuns = function(opt, cb) {
    this.aggregate([
        {
            "$lookup": {
                "from": "projects",
                "localField": "project",
                "foreignField": "_id",
                "as": "project"
            }
        },
        {
            "$lookup": {
                "from": "computers",
                "localField": "computer",
                "foreignField": "_id",
                "as": "computer"
            }
        },
        {
            "$lookup": {
                "from": "groups",
                "localField": "group",
                "foreignField": "_id",
                "as": "group"
            }
        },
        {
            "$unwind": "$project"
        },
        {
            "$unwind": "$computer"
        },
        {
            "$unwind": { path: "$group", preserveNullAndEmptyArrays: true }
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


// returns a count of runs
schema.statics.getCount = function(opt, cb) {
    this.aggregate([
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


// pre-save setter
schema.pre('save', function(next) {
    var now = moment.utc();

    // initial setting of create date
    if (!this.created_at) {
        this.created_at = now;
    }

    // ensure that if we have an end date, has_finished is true
    if (this.ended_at != null) {
        this.has_finished = true;
    }

    // set updated date
    this.updated_at = now;
    next();
});


// save model
module.exports = mongoose.model('Run', schema);