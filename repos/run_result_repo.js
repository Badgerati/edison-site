// libs
var moment = require('moment');
var run_result = require('../models/run_result.js');


// repo
function RunResultRepo() { }
module.exports = RunResultRepo;


// get the slowest results across all runs (with filters)
RunResultRepo.getSlowestResults = function(limit, project, computer, group, cb) {
    limit = parseInt(limit || 20);

    var query = {};

    // do we filter by project?
    if (project) {
        query['run.project'] = project._id;
    }

    // do we filter by computer?
    if (computer) {
        query['run.computer'] = computer._id;
    }

    // do we filter by group?
    if (group) {
        query['run.group'] = group._id;
    }

    run_result.getSlowestResults({
        query: query,
        limit: limit
    },
    (e, r) => cb(e, r));
}

// get the top failing results across all runs (with filters)
RunResultRepo.getTopFailingResults = function(limit, project, computer, group, cb) {
    limit = parseInt(limit || 20);

    var query = {};

    // do we filter by project?
    if (project) {
        query['run.project'] = project._id;
    }

    // do we filter by computer?
    if (computer) {
        query['run.computer'] = computer._id;
    }

    // do we filter by group?
    if (group) {
        query['run.group'] = group._id;
    }

    run_result.getTopFailingResults({
        query: query,
        limit: limit
    },
    (e, r) => cb(e, r));
}



// maps out multiple results for csv downloading
RunResultRepo.mapoutCsvArray = function(runResults) {
    if (!runResults || runResults.length == 0) {
        return [];
    }

    runResults.forEach((v, i) => runResults[i] = RunResultRepo.mapoutCsv(v));
    return runResults;
}

// maps a result for csv downloading
RunResultRepo.mapoutCsv = function(runResult) {
    if (!runResult) {
        return null;
    }

    // dates
    var dateFormat = 'YYYY-MM-DD HH:mm:ss';
    var created = moment(runResult.created_at);
    var updated = moment(runResult.updated_at);

    // errors, trace and comment
    var errormessage = runResult.result.error_message
        ? runResult.result.error_message.message
        : '';

    var stacktrace = runResult.result.stack_trace
        ? runResult.result.stack_trace.stacktrace
        : '';

    var comment = runResult.result.comment
        ? runResult.result.comment.comment
        : '';

    // mapped object
    return {
        testname: runResult.result.test.name,
        namespace: runResult.result.test.namespace,
        assembly: runResult.result.test.assembly,
        state: runResult.state,
        errormessage: errormessage,
        stacktrace: stacktrace,
        comment: comment,
        duration: runResult.duration,
        fixed: runResult.is_fixed,
        created: created.format(dateFormat),
        updated: updated.format(dateFormat)
    }
}