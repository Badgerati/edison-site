// libs
var express = require('express');
var csv = require('csv-express');
var config = require('../config.js');

// helpers
var NavHelper = require('../helpers/nav_helper.js');

// repos
var RunRepo = require('../repos/run_repo.js');


// express router
var router = express.Router();


// page names
var page = {
    index: 'index',
    runs: 'runs',
    results: 'results',
    tests: 'tests',
    history: 'history',
    compare: 'compare',
    dashboard: 'dashboard',
    about: 'about',
    search: 'search'
}


// helper render functions
function renderHistory(res, req, testId) {
    NavHelper.getSubNavLists((e, p, c, g) => {
        res.render(page.history, {
            pageName: page.history,
            computers: c,
            computer: req.query.computer,
            groups: g,
            group: req.query.group,
            projects: p,
            project: req.query.project,
            testId: testId,
            error: e
        });
    });
}


module.exports = function() {
    /////////////////////////////////////
    // home page
    /////////////////////////////////////
    router.get('/', function(req, res) {
        // function to render the page
        var render = function(err, p, c, g) {
            res.render(page.index, {
                pageName: page.index,
                computers: c,
                computer: req.query.computer,
                groups: g,
                group: req.query.group,
                projects: p,
                project: req.query.project,
                error: err
            });
        }

        // populate the lists
        NavHelper.getSubNavLists((e, p, c, g) => {
            render(e, p, c, g);
        });
    });


    /////////////////////////////////////
    // runs
    /////////////////////////////////////
    router.get('/' + page.runs, function(req, res) {
        // function to render the page
        var render = function(err, p, c, g) {
            res.render(page.runs, {
                pageName: page.runs,
                computers: c,
                computer: req.query.computer,
                groups: g,
                group: req.query.group,
                projects: p,
                project: req.query.project,
                error: err
            });
        }

        // populate the lists
        NavHelper.getSubNavLists((e, p, c, g) => {
            render(e, p, c, g);
        });
    });


    /////////////////////////////////////
    // compare
    /////////////////////////////////////
    router.get('/' + page.runs + '/' + page.compare, function(req, res) {
        // function to render the page
        var render = function(err, p, c, g) {
            res.render(page.compare, {
                pageName: page.compare,
                computers: c,
                computer: req.query.computer,
                groups: g,
                group: req.query.group,
                projects: p,
                project: req.query.project,
                error: err
            });
        }

        // populate the lists
        NavHelper.getSubNavLists((e, p, c, g) => {
            render(e, p, c, g);
        });
    })


    /////////////////////////////////////
    // history
    /////////////////////////////////////
    router.get('/' + page.tests + '/' + page.history, function(req, res) {
        renderHistory(res, req, null);
    });

    router.get('/' + page.tests + '/:testId/' + page.history, function(req, res) {
        var testId = req.params.testId;
        renderHistory(res, req, testId);
    });


    /////////////////////////////////////
    // results
    /////////////////////////////////////
    router.get('/' + page.runs + '/:runId/' + page.results, function(req, res) {
        var runId = req.params.runId

        // function to render the page
        var render = function(err, run) {
            res.render(page.results, {
                pageName: page.results,
                runId: runId,
                run: RunRepo.mapout(run),
                error: err
            });
        }

        if (!runId) {
            render('No run supplied to load results');
            return;
        }

        RunRepo.getById(runId, (e, r) => {
            if (!r && !e) {
                e = 'Run supplied does not exist'
            }

            render(e, r);
        });
    });
    
    router.get('/' + page.runs + '/:runId/' + page.results + '/csv', function(req, res) {
        var runId = req.params.runId;

        RunRepo.getById(runId, (e, run) => {
            if (e) { res.send(e); return; }
            var filename = 'Results_' + run.name + '.csv';

            RunRepo.getAllResults(runId, (e, results) => {
                if (e) { res.send(e); return; }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader("Content-Disposition", 'attachment; filename=' + filename);
                res.csv(results, true);
            });
        });
    });


    /////////////////////////////////////
    // search
    /////////////////////////////////////
    router.get('/' + page.search, function(req, res) {
        res.render(page.search, {
            pageName: page.search,
            query: req.query.query
        });
    });


    /////////////////////////////////////
    // about
    /////////////////////////////////////
    router.get('/' + page.about, function(req, res) {
        res.render(page.about, {
            pageName: page.about
        });
    });

    return router;
}