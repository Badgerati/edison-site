// libs
var express = require('express');
var mongoose = require('mongoose');
var logger = require('../../tools/logger.js');

// helpers
var NavHelper = require('../../helpers/nav_helper.js');
var GeneralHelper = require('../../helpers/general_helper.js');

// repos
var TestRepo = require('../../repos/test_repo.js');


// express router
var router = express.Router();


module.exports = function() {

    // retrieves the results history for the passed testId
    router.get('/:testId/history', (req, res) => {
        var testId = req.params.testId;
        var project = req.query.project;
        var computer = req.query.computer;
        var group = req.query.group;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        // get filter IDs
        NavHelper.getSubNavFilters(project, computer, group, (e, p, c, g) => {
            if (e) { logger.error(res, e); return; }

            var query = { 'result.test._id': mongoose.Types.ObjectId(testId) };

            TestRepo.getPaginatedHistory(query, page, limit, p, c, g, (e, r) => {
                if (e) { logger.error(res, e); return; }
                res.json({ error: false, pagination: r });
            });
        });
    });

    // retieves the results history for the search terms passed
    router.get('/history', (req, res) => {
        var project = req.query.project;
        var computer = req.query.computer;
        var group = req.query.group;
        var search = req.query.search;
        var page = (req.query.page || 1);
        var limit = (req.query.limit || 25);

        // get filter IDs
        NavHelper.getSubNavFilters(project, computer, group, (e, p, c, g) => {
            if (e) { logger.error(res, e); return; }

            // get the testId
            TestRepo.searchForTest(search, (e, t) => {
                if (e) { logger.error(res, e); return; }
                if (!t) { res.json({ error: false, pagination: null }); return; }

                var query = { 'result.test._id': mongoose.Types.ObjectId(t) };

                TestRepo.getPaginatedHistory(query, page, limit, p, c, g, (e, r) => {
                    if (e) { logger.error(res, e); return; }
                    res.json({ error: false, pagination: r });
                });
            });
        });
    });

    return router;
}