// libs
var express = require('express');
var check = require('validator');
var mongoose = require('mongoose');
var enums = require('../../tools/enums.js');
var logger = require('../../tools/logger.js');

// helpers
var NavHelper = require('../../helpers/nav_helper.js');
var GeneralHelper = require('../../helpers/general_helper.js');

// repos
var RunRepo = require('../../repos/run_repo.js');
var TestRepo = require('../../repos/test_repo.js');
var ResultRepo = require('../../repos/result_repo.js');
var ErrorMessageRepo = require('../../repos/error_message_repo.js');
var StackTraceRepo = require('../../repos/stack_trace_repo.js');


// express router
var router = express.Router();


module.exports = function() {

    // get runs with a limit and filter
    router.get('/', (req, res) => {
        var project = req.query.project;
        var computer = req.query.computer;
        var group = req.query.group;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        // get filter IDs
        NavHelper.getSubNavFilters(project, computer, group, (e, p, c, g) => {
            if (e) { logger.error(res, e); return; }

            // get the runs for the filters
            RunRepo.getPaginatedRuns(page, limit, p, c, g, (e, r) => {
                if (e) { logger.error(res, e); return; }
                res.json({ error: false, pagination: r });
            });
        });
    });


    // get a run with passed ID
    router.get('/:runId', (req, res) => {
        RunRepo.getById(req.params.runId, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, run: RunRepo.mapout(r) });
        });
    });


    // creates a new run and returns the ID
    router.post('/', (req, res) => {
        var name = req.body.name;
        var project = req.body.project;
        var computer = req.body.computer;
        var group = req.body.group;

        // validate data
        if (check.isEmpty(name)) {
            logger.error(res, null, 'No name supplied when creating new run');
            return;
        }

        if (check.isEmpty(project)) {
            logger.error(res, null, 'No project supplied when creating new run');
            return;
        }

        if (check.isEmpty(computer)) {
            logger.error(res, null, 'No computer name supplied when creating new run');
            return;
        }

        // get the proj/comp/group and create if they dont exist yet
        GeneralHelper.getPCGByNameOrCreate(project, computer, group, (e, p, c, g) => {
            if (e) { logger.error(res, e); return; }

            // create the run, and return the runId
            RunRepo.create(name, p, c, g, (e, r) => {
                if (e) { logger.error(res, e); return; }
                res.json({ error: false, runId: r._id });
            });
        });
    });


    // finishes a run with passed runId
    router.put('/:runId/finish', (req, res) => {
        RunRepo.finish(req.params.runId, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, run: RunRepo.mapout(r) });
        });
    });


    // retrieves a paginated results comparison between two runs
    router.get('/:runId1/compare/:runId2', (req, res) => {
        var runId1 = req.params.runId1;
        var runId2 = req.params.runId2;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        RunRepo.compare(page, limit, runId1, runId2, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, pagination: r });
        });
    });


    // retrieves the distinct errors for a run
    router.get('/:runId/errors', (req, res) => {
        var runId = req.params.runId;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        RunRepo.getResultErrors(runId, page, limit, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, pagination: r });
        });
    });


    // retrieves the results for the passed runId and errorId (using pagination)
    router.get('/:runId/errors/:errorId/results', (req, res) => {
        var runId = req.params.runId;
        var errorId = req.params.errorId;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        var query = {
            'run._id': mongoose.Types.ObjectId(runId),
            'result.error_message._id': mongoose.Types.ObjectId(errorId)
        }

        RunRepo.getResults(query, page, limit, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, pagination: r });
        });
    });


    // retrieves the results for the passed runId (using states filter and pagination)
    router.get('/:runId/results', (req, res) => {
        var runId = req.params.runId;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        var states = (req.query.states || enums.Result[2]);
        states = states.replace(' ', '').split(',');

        var query = {
            'run._id': mongoose.Types.ObjectId(runId),
            'state': { $in: states }
        }

        RunRepo.getResults(query, page, limit, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, pagination: r });
        });
    });


    // inserts a test result against the passed runId
    router.post('/:runId/results', (req, res) => {
        var runId = req.params.runId;
        var testName = req.body.test.name;
        var testNameSpace = (req.body.test.namespace || '');
        var testAssembly = (req.body.test.assembly || '');
        var errorMessage = (req.body.errorMessage || '');
        var stackTrace = (req.body.stackTrace || '');
        var duration = req.body.duration;
        var state = req.body.state;

        // has a test name been passed
        if (check.isEmpty(testName)) {
            logger.error(res, null, 'No test name supplied when inserting result');
            return;
        }

        // ensure a duration was passed
        if (duration == null) {
            logger.error(res, null, 'No duration (ms) supplied when inserting result');
            return;
        }

        // does the result state exist?
        if (GeneralHelper.getArrayIndex(enums.Result, state) == -1) {
            logger.error(res, null, 'Invalid state for test result passed: ' + state);
            return;
        }

        // ensure the state isn't "Unknown"
        if (state.toLowerCase() == enums.Result[0].toLowerCase()) {
            logger.error(res, null, 'The state of a result cannot be "' + enums.Result[0] + '"');
            return;
        }

        // get or create the test
        TestRepo.getByDetails(testName, testNameSpace, testAssembly, (e, t) => {
            if (e) { logger.error(res, e); return; }

            // get or create the error
            ErrorMessageRepo.getByMessage(errorMessage, (e, m) => {
                if (e) { logger.error(res, e); return; }

                // get or create the stack trace
                StackTraceRepo.getByTrace(stackTrace, (e, s) => {
                    if (e) { logger.error(res, e); return; }

                    // get or create the result
                    ResultRepo.getByDetails(t, m, s, (e, r) => {
                        if (e) { logger.error(res, e); return; }

                        // map the result to the run
                        RunRepo.addResult(runId, r, state, duration, (e) => {
                            logger.error(res, e);
                        });
                    });
                });
            });
        });
    });


    // set a result against a run to be fixed, with an optional comment
    router.put('/:runId/results/:resultId/fixed', (req, res) => {
        var runId = req.params.runId;
        var resultId = req.params.resultId;
        var comment = (req.body.comment || '');

        RunRepo.fixResult(runId, resultId, comment, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, result: r });
        });
    });


    // returns the top slowest results for the run
    router.get('/:runId/results/slowest', (req, res) => {
        var runId = req.params.runId;
        var limit = req.query.limit;

        RunRepo.getSlowestResults(runId, limit, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, results: r });
        });
    });


    // returns the top failing results for the run
    router.get('/:runId/results/failing', (req, res) => {
        var runId = req.params.runId;
        var limit = req.query.limit;

        RunRepo.getTopFailingResults(runId, limit, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, results: r });
        });
    });


    // returns a justifier for the run (if failed tests are fixed and any comments)
    router.get('/:runId/results/justifier', (req, res) => {
        var runId = req.params.runId;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        var states = [
            enums.Result[2],
            enums.Result[3],
            enums.Result[5]
        ];

        var query = {
            'run._id': mongoose.Types.ObjectId(runId),
            'state': { $in: states }
        }

        RunRepo.getResults(query, page, limit, (e, r) => {
            if (e) { logger.error(res, e); return; }
            res.json({ error: false, pagination: r });
        });
    });


    // deletes a run and all associated test results
    router.delete('/:runId', (req, res) => {
        // delete the results (RunResults)
        // delete the run (Run)
    });


    return router;
}