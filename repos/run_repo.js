// libs
var _ = require('lodash');
var mongoose = require('mongoose');
var moment = require('moment');
var run = require('../models/run.js');
var run_result = require('../models/run_result.js');
var enums = require('../tools/enums.js');

// repos
var CommentRepo = require('./comment_repo.js');
var RunResultRepo = require('./run_result_repo.js');


// repo
function RunRepo() { }
module.exports = RunRepo;


// create a new run
RunRepo.create = function(name, project, computer, group, cb) {
    if (!name) { cb('No name supplied when creating run'); return; }
    if (!project) { cb('No project supplied when creating run'); return; }
    if (!computer) { cb('No computer supplied when creating run'); return; }

    var projId = project._id;
    var compId = computer._id;
    var grpId = group ? group._id : null;

    var r = new run({
        name: name,
        project: projId,
        computer: compId,
        group: grpId,
        stats: {
            total_count: 0,
            pass_count: 0,
            fail_count: 0
        },
        has_finished: false
    });

    r.save((e) => cb(e, r));
}

// finishes a run with passed id
RunRepo.finish = function(id, cb) {
    RunRepo.getById(id, (e, r) => {
        if (e) { cb(e); return; }
        if (!r) { cb('Run could not be found'); return; }
        if (r.has_finished) { cb('Run has already finished'); return; }

        run.findByIdAndUpdate(
            id,
            { $set: { 'ended_at': moment.utc(), 'has_finished': true } },
            { new: true },
            (e, r) => cb(e, r)
        );
    });
}

// get a run by id
RunRepo.getById = function(id, cb) {
    run.findById(id)
        .populate('project')
        .populate('computer')
        .populate('group')
        .exec((e, r) => cb(e, r));
}

// get a run by name
RunRepo.getByName = function(name, cb) {
    run.findOne({ 'name': name }, (e, r) => cb(e, r));
}

// get all runs by limit
RunRepo.getAll = function(limit, cb) {
    limit = (limit || 10);

    run.lookup({
        query: {},
        sort: { created_at: -1 },
        limit: limit
    },
    (e, r) => cb(e, r));
}

// get runs filtered by project/computer and group
RunRepo.getByFilter = function(limit, project, computer, group, cb) {
    limit = parseInt(limit || 10);

    var query = {};

    // do we filter by project?
    if (project) {
        query['project._id'] = project._id;
    }

    // do we filter by computer?
    if (computer) {
        query['computer._id'] = computer._id;
    }

    // do we filter by group?
    if (group) {
        query['group._id'] = group._id;
    }

    run.lookup({
        query: query,
        sort: { created_at: -1 },
        limit: limit
    },
    (e, r) => cb(e, r));
}

// update a counter for the run
RunRepo.updateCounter = function(id, state, cb) {
    var dynset = { $inc: {} };
    dynset.$inc['stats.total_count'] = 1;

    if (state.toLowerCase() == 'success') {
        dynset.$inc['stats.pass_count'] = 1;
    }

    run.findByIdAndUpdate(
        id,
        dynset,
        { new: true },
        (e, r) => cb(e, r)
    );
}

// deletes a run and results by id
RunRepo.delete = function(id, cb) {
    
}

// returns the count of runs for a project, computer or group
RunRepo.getCount = function(project, computer, group, cb) {
    var query = { };
    
    // do we filter by project?
    if (project) {
        query['project'] = project._id;
    }

    // do we filter by computer?
    if (computer) {
        query['computer'] = computer._id;
    }

    // do we filter by group?
    if (group) {
        query['group'] = group._id;
    }

    run.getCount({ query: query }, (e, c) => cb(e, c));
}

// returns paginated list of runs
RunRepo.getPaginatedRuns = function(page, limit, project, computer, group, cb) {
    // page limiting
    page = parseInt(page || 1);
    limit = parseInt(limit || 25);

    if (limit <= 0) { limit = 1; }
    if (limit > 100) { limit = 100; }

    // the query
    var query = { };
    
    // do we filter by project?
    if (project) {
        query['project._id'] = mongoose.Types.ObjectId(project._id);
    }

    // do we filter by computer?
    if (computer) {
        query['computer._id'] = mongoose.Types.ObjectId(computer._id);
    }

    // do we filter by group?
    if (group) {
        query['group._id'] = mongoose.Types.ObjectId(group._id);
    }

    // get the count of possible results
    RunRepo.getCount(project, computer, group, (e, total) => {
        if (e) { cb(e); return; }

        // restrict the page number
        var pages = Math.ceil(total / limit);
        if (page > pages) { page = pages }
        if (page <= 0) { page = 1; }

        // get the paginated results history
        run.getPaginatedRuns({
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
                runs: RunRepo.mapoutArray(r)
            });
        });
    });
}

// gets a results against a run by id
RunRepo.getResult = function(id, result, cb) {
    run_result.findOne({
        'run': id,
        'result': result._id
    },
    (e, r) => cb(e, r));
}

// returns paginated results for a run
RunRepo.getPaginatedResults = function(id, page, limit, states, cb) {
    // page limiting
    page = parseInt(page || 1);
    limit = parseInt(limit || 25);
    states = (states || enums.Result);

    if (limit <= 0) { limit = 1; }
    if (limit > 100) { limit = 100; }

    // get the count of possible results
    RunRepo.getResultCount(id, states, (e, total) => {
        if (e) { cb(e); return; }

        // restrict the page number
        var pages = Math.ceil(total / limit);
        if (page > pages) { page = pages }
        if (page <= 0) { page = 1; }

        // get the paginated results
        run_result.getPaginatedResults({
            query: {
                run: mongoose.Types.ObjectId(id),
                state: { $in: states }
            },
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

// get the top slowest results for the run by id
RunRepo.getSlowestResults = function(id, limit, cb) {
    limit = parseInt(limit || 20);

    run_result.getSlowestResults({
        query: { 'run._id': mongoose.Types.ObjectId(id) },
        limit: limit
    },
    (e, r) => cb(e, r));
}

// get the top failing results for the run by id
RunRepo.getTopFailingResults = function(id, limit, cb) {
    limit = parseInt(limit || 20);

    run_result.getTopFailingResults({
        query: { 'run._id': mongoose.Types.ObjectId(id) },
        limit: limit
    },
    (e, r) => cb(e, r));
}

// add a result to the run by id
RunRepo.addResult = function(id, result, state, duration, cb) {
    var rslt = {
        run: id,
        result: result._id,
        state: state,
        duration: duration,
        is_fixed: false
    };

    run_result.findOneAndUpdate(
        {
            'run': rslt.run,
            'result': rslt.result
        },
        rslt,
        { upsert: true, new: true },
        (e, v) => {
            RunRepo.updateCounter(id, state, () => cb(e, v))
        }
    );
}

// returns the number of tests run/passed
RunRepo.getResultCount = function(id, states, cb) {
    var search = states
        ? { 'run': id, 'state': { $in: states } }
        : { 'run': id }

    run_result.count(search, (e, c) => cb(e, c));
}

// set a result against a run to be fixed (resultId is the RunResultId)
RunRepo.fixResult = function(id, resultId, comment, cb) {
    // create a comment for assigning
    CommentRepo.getByComment(comment, (e, c) => {
        if (e) { cb(e); return; }

        // update the result to be fixed
        run_result.findOneAndUpdate(
            {
                'run': id,
                '_id': resultId
            },
            { $set: { 'comment': c._id, 'is_fixed': true } },
            { new: true },
            (e, r) => cb(e, r)
        );
    });
}

// gets all results for a run (such as for a csv download)
RunRepo.getAllResults = function(id, cb) {
    run_result.getAllResults({
        query: { 
            run: mongoose.Types.ObjectId(id)
        }
    },
    (e, r) => cb(e, RunResultRepo.mapoutCsvArray(r)));
}

// returns all distinct errors for a run
RunRepo.getResultErrors = function(id, cb) {
    run_result.getErrors({
        query: {
            run: mongoose.Types.ObjectId(id)
        }
    },
    (e, r) => cb(e, r));
}

// compares two run's results
RunRepo.compare = function(page, limit, runId1, runId2, cb) {
    // page limiting
    page = parseInt(page || 1);
    limit = parseInt(limit || 25);

    if (limit <= 0) { limit = 1; }
    if (limit > 100) { limit = 100; }
    
    // helper function for getting run details
    var getRuns = function(cb) {
        // get first run details
        RunRepo.getById(runId1, (e, run1) => {
            if (e) { cb(e); return; }

            // get second run details
            RunRepo.getById(runId2, (e, run2) => {
                cb(e, run1, run2);
            });
        });
    }

    // helper function for getting all results
    var getResults = function(cb) {
        // get all results for first run
        run_result.getAllResults({ query: { run: mongoose.Types.ObjectId(runId1) } }, (e, res1) => {
            if (e) { cb(e); return; }

            // get all results for second run
            run_result.getAllResults({ query: { run: mongoose.Types.ObjectId(runId2) } }, (e, res2) => {
                cb(e, res1, res2);
            });
        });
    }

    // get both run details
    getRuns((e, run1, run2) => {
        if (e) { cb(e); return; }

        // get all results for both runs
        getResults((e, res1, res2) => {
            if (e) { cb(e); return; }

            // convert to arrays into hashes for faster comparing
            var res1 = _.reduce(res1, (map, value) => {
                map[value.result.test._id] = value;
                return map;
            }, {});

            var res2 = _.reduce(res2, (map, value) => {
                map[value.result.test._id] = value;
                return map;
            }, {});

            // compare the results from run1 to run2 (only return results where states change)
            var comparison = [];
            var exists = false;

            // for run1 -> 2, get results that change state or didn't exist in 2
            _.each(res1, (v, k) => {
                exists = res2[k];

                // if it didn't exist in 2, or state changed, record it
                if (!exists || (v.state != exists.state)) {
                    comparison[comparison.length] = {
                        test: v.result.test,
                        created: v.created_at,
                        state1: v.state,
                        state2: (exists ? exists.state : 'n/a')
                    }
                }
            });

            // for run2 -> 1, only get results that now don't exist in 1 (state changes will be above)
            _.each(res2, (v, k) => {
                exists = res1[k];

                // if it didn't exist in 2, or state changed, record it
                if (!exists) {
                    comparison[comparison.length] = {
                        test: v.result.test,
                        created: v.created_at,
                        state1: 'n/a',
                        state2: v.state
                    }
                }
            });

            // sort the results
            comparison = _.sortBy(comparison, ['created']);

            // paginate the results
            var total = comparison.length;
            var pages = Math.ceil(total / limit);
            if (page > pages) { page = pages }
            if (page <= 0) { page = 1 }

            comparison = _.drop(comparison, ((page - 1) * limit));
            comparison = _.take(comparison, limit);

            cb(null, {
                pages: pages,
                total: total,
                found: total,
                page: page,
                limit: limit,
                compare: comparison,
                run1: RunRepo.mapout(run1),
                run2: RunRepo.mapout(run2)
            });
        });
    });
}



// maps out multiple runs to their external objects
RunRepo.mapoutArray = function(runs) {
    if (!runs || runs.length == 0) {
        return [];
    }

    runs.forEach((v, i) => runs[i] = RunRepo.mapout(v));
    return runs;
}

// maps a run to it's external object
RunRepo.mapout = function(run) {
    if (!run) {
        return null;
    }

    // dates
    var dateFormat = 'YYYY-MM-DD HH:mm:ss';
    var created = moment(run.created_at);
    var updated = moment(run.updated_at);
    var ended = run.ended_at ? moment(run.ended_at) : null;

    // duration
    var duration = run.has_finished && ended
        ? ended.diff(created)
        : updated.diff(created);

    // group
    var group = { id: null, name: null };
    if (run.group) {
        group.id = run.group._id;
        group.name = run.group.name;
    }

    // mapped object
    return {
        id: run._id,
        name: run.name,
        project: {
            id: run.project._id,
            name: run.project.name
        },
        computer: {
            id: run.computer._id,
            name: run.computer.name
        },
        group: group,
        stats: {
            total: run.stats.total_count,
            pass: run.stats.pass_count
        },
        duration: duration,
        finished: run.has_finished,
        created: created.format(dateFormat),
        updated: updated.format(dateFormat),
        ended: ended ? ended.format(dateFormat) : null
    };
}