// libs
var express = require('express');
var check = require('validator');
var config = require('../../config.js');
var enums = require('../../tools/enums.js');
var logger = require('../../tools/logger.js');

// helpers
var NavHelper = require('../../helpers/nav_helper.js');
var GeneralHelper = require('../../helpers/general_helper.js');

// repos
var RunResultRepo = require('../../repos/run_result_repo.js');
var TestRepo = require('../../repos/test_repo.js');
var ResultRepo = require('../../repos/result_repo.js');
var ErrorMessageRepo = require('../../repos/error_message_repo.js');
var StackTraceRepo = require('../../repos/stack_trace_repo.js');


// express router
var router = express.Router();


module.exports = function() {

        // returns the top slowest tests
        router.get('/slowest', (req, res) => {
            var limit = req.query.limit;
            var project = req.query.project;
            var computer = req.query.computer;
            var group = req.query.group;

            // get filter IDs
            NavHelper.getSubNavFilters(project, computer, group, (e, p, c, g) => {
                if (e) { logger.error(res, e); return; }

                // get the slowest results for the filters
                RunResultRepo.getSlowestResults(limit, p, c, g, (e, r) => {
                    if (e) { logger.error(res, e); return; }
                    res.json({ error: false, results: r });
                });
            });
        });


        // returns the top failing tests
        router.get('/failing', (req, res) => {
            var limit = req.query.limit;
            var project = req.query.project;
            var computer = req.query.computer;
            var group = req.query.group;

            // get filter IDs
            NavHelper.getSubNavFilters(project, computer, group, (e, p, c, g) => {
                if (e) { logger.error(res, e); return; }

                // get the top failing results for the filters
                RunResultRepo.getTopFailingResults(limit, p, c, g, (e, r) => {
                    if (e) { logger.error(res, e); return; }
                    res.json({ error: false, results: r });
                });
            });
        });


        return router;
}