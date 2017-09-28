//libs
var mongoose = require('mongoose');
var test = require('../models/test.js');
var run_result = require('../models/run_result.js');

// helpers
var GeneralHelper = require('../helpers/general_helper.js');


// repo
function TestRepo() { }
module.exports = TestRepo;


// get a by id
TestRepo.getById = function(id, cb) {
    test.findById(id).exec((e, v) => cb(e, v));
}

// get a by details
TestRepo.getByDetails = function(name, namespace, assembly, cb) {
    var hash = GeneralHelper.getHash([ name, namespace, assembly ]);

    var tst = {
        name: name,
        namespace: namespace,
        assembly: assembly,
        hash: hash
    };

    test.findOneAndUpdate(
        { 'hash': hash },
        tst,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get a by hash
TestRepo.getByHash = function(hash, cb) {
    if (!hash) { cb(); return; }
    test.findOne({ 'hash': hash }, (e, v) => cb(e, v));
}

// get first test by search terms
TestRepo.searchForTest = function(name, cb) {
    test.searchForTest({
        query: { name: { $regex: new RegExp(name, 'i') } }
    },
    (e, t) => cb(e, (t ? t[0]._id : null)));
}

// retrieves a test history by passed query
TestRepo.getPaginatedHistory = function(query, page, limit, project, computer, group, cb) {
    // page limiting
    page = parseInt(page || 1);
    limit = parseInt(limit || 25);

    if (limit <= 0) { limit = 1; }
    if (limit > 100) { limit = 100; }
    
    // do we filter by project?
    if (project) {
        query['run.project._id'] = mongoose.Types.ObjectId(project._id);
    }

    // do we filter by computer?
    if (computer) {
        query['run.computer._id'] = mongoose.Types.ObjectId(computer._id);
    }

    // do we filter by group?
    if (group) {
        query['run.group._id'] = mongoose.Types.ObjectId(group._id);
    }

    // get the count of possible results
    run_result.getCount({ query: query }, (e, total) => {
        if (e) { cb(e); return; }

        // restrict the page number
        var pages = Math.ceil(total / limit);
        if (page > pages) { page = pages }
        if (page <= 0) { page = 1; }

        // get the paginated results history
        run_result.getResultsHistory({
            query: query,
            page: page,
            limit: limit
        },
        (e, r) => {
            if (e) { cb(e); return; }
            cb(null, {
                pages: pages,
                total: total,
                found: r.length,
                page: page,
                limit: limit,
                results: r
            });
        });
    });
}