
$(document).ready(() => {
    var funcOnPageChange = null;

    // if there's a testId, load the results
    if (getTestId()) {
        funcOnPageChange = loadHistoryById;
        loadHistoryById(1);
    }

    // otherwise we're searching for results
    else {
        funcOnPageChange = loadHistoryBySearch;

        $('#history-search').click(function() {
            loadHistoryBySearch(1);
        });
    }

    // bind select events
    bindSelectChange('project', funcOnPageChange);
    bindSelectChange('computer', funcOnPageChange);
    bindSelectChange('group', funcOnPageChange);
});


function getTestId() {
    return $('div[data-test-id]').data('test-id');
}


function getSearchQuery() {
    return ($('#history-query').val() || '');
}


function doHistoryAjaxCall(url) {
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('history-progress');

        if (e || d.error) {
            showAlert('history-error', null, (e || d.message));
            return;
        }

        clearTable('history');

        if (!d.pagination || !d.pagination.results || d.pagination.results.length == 0) {
            showAlert('history-info', null, 'There are no results for the test to display');
            return;
        }

        appendTableResultRows(d.pagination.results, 'history', { expandable: true, history: true });
        bindPagination('history-paging', d.pagination.page, d.pagination.pages, loadHistoryById);
    });
}


function loadHistoryBySearch(page) {
    page = (page || 1);

    hideAlert(['history-error', 'history-info']);
    showProgress('history-progress', 'history-load');

    var project = getSelectOption('project', 'All', true);
    var computer = getSelectOption('computer', 'All', true);
    var group = getSelectOption('group', 'All', true);
    var search = getSearchQuery();
    
    var url = '/api/v1/tests/history?limit=25&page=' + page + '&search=' + search + '&project=' + project + '&computer=' + computer + '&group=' + group;
    doHistoryAjaxCall(url);
}


function loadHistoryById(page) {
    page = (page || 1);

    hideAlert(['history-error', 'history-info']);
    showProgress('history-progress', 'history-load');

    var project = getSelectOption('project', 'All', true);
    var computer = getSelectOption('computer', 'All', true);
    var group = getSelectOption('group', 'All', true);

    var url = '/api/v1/tests/' + getTestId() + '/history?limit=25&page=' + page + '&project=' + project + '&computer=' + computer + '&group=' + group;
    doHistoryAjaxCall(url);
}