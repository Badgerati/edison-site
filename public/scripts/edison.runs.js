
$(document).ready(() => {
    // load initial data
    loadRuns(1);

    // bind select events
    bindSelectChange('project', loadRuns);
    bindSelectChange('computer', loadRuns);
    bindSelectChange('group', loadRuns);

    // bind refresh
    bindRefreshToggle(loadRuns);
});


function loadRuns(page) {
    page = (page || 1);

    hideAlert(['runs-error', 'runs-info']);
    showProgress('runs-progress', '#runs-load');

    var project = getSelectOption('project', 'All', true);
    var computer = getSelectOption('computer', 'All', true);
    var group = getSelectOption('group', 'All', true);

    var url = '/api/v1/runs?limit=25&page=' + page + '&project=' + project + '&computer=' + computer + '&group=' + group;
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('#runs-progress');

        if (e || d.error) {
            showAlert('runs-error', null, (e || d.message));
            return;
        }

        clearTable('#runs');

        if (!d.pagination.runs || d.pagination.runs.length == 0) {
            showAlert('runs-info', null, 'There are no test runs to display');
            return;
        }

        appendTableRunRows({ runs: d.pagination.runs, table: '#runs', includeUrl: true });
        bindPagination('#runs-paging', d.pagination.page, d.pagination.pages, loadRuns);
    });
}