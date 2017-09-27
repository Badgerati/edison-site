
$(document).ready(() => {
    // load initial data
    loadPage();

    // bind selects
    bindSelectChange('project', loadPage);
    bindSelectChange('computer', loadPage);
    bindSelectChange('group', loadPage);

    // bind refresh
    bindRefreshToggle(loadPage);
});


function loadPage() {
    loadLatestRuns();
    loadSlowestTests();
    loadTopFailingTests();
}


function loadLatestRuns() {
    hideAlert(['latest-runs-error', 'latest-runs-info']);
    showProgress('latest-runs-progress', 'latest-runs-panel');

    var opts = getSubNavFilters();

    var url = '/api/v1/runs?limit=5&project=' + opts.project + '&computer=' + opts.computer + '&group=' + opts.group
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('latest-runs-progress');

        if (e || d.error) {
            showAlert('latest-runs-error', null, (e || d.message));
            return;
        }

        clearTable('latest-runs');

        if (!d.pagination.runs || d.pagination.runs.length == 0) {
            showAlert('latest-runs-info', null, 'There are no test runs to display');
            return;
        }

        appendTableRunRows({ runs: d.pagination.runs, table: 'latest-runs', includeUrl: true });
    });
}


function loadSlowestTests() {
    
    hideAlert(['slowest-tests-error', 'slowest-tests-info']);
    showProgress('slowest-tests-progress', 'slowest-tests-panel');

    var opts = getSubNavFilters();

    var url = '/api/v1/results/slowest?limit=5&project=' + opts.project + '&computer=' + opts.computer + '&group=' + opts.group
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('slowest-tests-progress');

        if (e || d.error) {
            showAlert('slowest-tests-error', null, (e || d.message));
            return;
        }

        clearTable('slowest-tests');

        if (!d.results || d.results.length == 0) {
            showAlert('slowest-tests-info', null, 'There are no tests to display');
            return;
        }

        var values = null;
        d.results.forEach((v, i) => {
            values = [
                v.result.test.name,
                moment(v.duration).format('ss[s] SSS[ms]')
            ]

            appendTableRow('slowest-tests', values, v._id);
        });
    });
}


function loadTopFailingTests() {
    
    hideAlert(['failing-tests-error', 'failing-tests-info']);
    showProgress('failing-tests-progress', 'failing-tests-panel');

    var opts = getSubNavFilters();

    var url = '/api/v1/results/failing?limit=5&project=' + opts.project + '&computer=' + opts.computer + '&group=' + opts.group
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('failing-tests-progress');

        if (e || d.error) {
            showAlert('failing-tests-error', null, (e || d.message));
            return;
        }

        clearTable('failing-tests');

        if (!d.results || d.results.length == 0) {
            showAlert('failing-tests-info', null, 'There are no tests to display');
            return;
        }

        var values = null;
        d.results.forEach((v, i) => {
            values = [
                v.result.test.name,
                v.count
            ]

            appendTableRow('failing-tests', values, v._id);
        });
    });
}