# Edison Website

* Test History (list of results for a test, and at top a total stats count [total times run, total fails/passes, etc.])
* Test Search (split down by project)
* View all TestRuns for a TestRunId
* View tests for a TestRun
* Top 20 slowest tests per TestRun
* Able to filter tests by result for TestRun
* Ability to compare one TestRun to another
* Full screen view of currently running TestRuns?

## Home Page

* Filterable by Project and Environemnt (default All/All)
* Shows recent last 5 runs
* Shows top 5 slowest tests
* Shows top 5 most failing tests

## Ideas

* When auto-refreshing, put load bar next to refresh btn
* Between "Results" and "Slow" tabs have an "Errors" tab (error limit: 20, result limit: 10)
    * Shows a table of grouped errors with how many results have that error (ordered by highest)
    * Clicking an error rows shows an expand row fo results (just name/space/assembly)
* Run tags (like groups, but can be multiple)


Need a mechanism to auto-complete runs that haven't be completed or updated after 1hr.
