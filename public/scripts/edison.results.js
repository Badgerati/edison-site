
$(document).ready(() => {
    // load initial data
    loadPage();

    // bind select events
    $('#status-filters button').click(function() {
        $(this).toggleClass('selected');

        if ($('#status-filters button.selected').length == 0) {
            $(this).toggleClass('selected');
        }
        else {
            loadResults(1);
        }
    });

    // bind refresh
    bindRefreshToggle(loadPage);
});


function loadPage() {
    loadResults(1);
    loadSlowestResults();
    loadJustifier(1);
}


function getRunId() {
    return $('.page-header').data('run-id');
}


function getSelectedFilters() {
    var statuses = '';

    $('#status-filters button.selected').each((v, i) => {
        statuses += ($(i).text() + ',');
    });

    return statuses.substring(0, statuses.length - 1);
}


function bindFixResults() {
    $('button.fix-result').unbind().click(function() {
        hideAlert(null, this, 0);
        disableElement(this);

        // controls
        var commentBox = $(this).closest('div.input-group').find('input[type="text"]');

        // get data
        var comment = $(commentBox).val();
        var resultId = $(this).closest('div[data-extra-id]').data('extra-id');
        var runId = getRunId();

        // validate data
        if (!comment) {
            showAlert(null, this, 'A comment must be supplied', commentBox);
            enableElement(this);
            return;
        }

        // build url
        var url = '/api/v1/runs/' + runId + '/results/' + resultId + '/fixed';
        var data = 'comment=' + comment;
        doAjaxCall(url, 'put', data, (e, d) => {
            if (e) {
                enableElement(this);
                return;
            }

            // disable comment box, show button as fixed and update table
            disableElement(commentBox);
            $(commentBox).val(comment);
            $(this).removeClass('fix-result').removeClass('btn-default').addClass('btn-success');

            // get row for updating
            var row = $(this).closest('table').find('tr[data-id="' + resultId + '"]');
            $(row).find('span.status').removeClass('glyphicon-remove').addClass('glyphicon-ok');

            // slide row back up
            $(row).click();
        }, this, null, commentBox);
    });
}


function loadResults(page) {
    hideAlert(['results-error', 'results-info']);
    showProgress('results-progress', 'results-load');

    var url = '/api/v1/runs/' + getRunId() + '/results?limit=25&page=' + page + '&states=' + getSelectedFilters();
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('results-progress');

        if (e || d.error) {
            showAlert('results-error', null, (e || d.message));
            return;
        }

        clearTable('results');

        if (!d.pagination.results || d.pagination.results.length == 0) {
            showAlert('results-info', null, 'There are no results to display');
            return;
        }

        appendTableResultRows(d.pagination.results, 'results', { expandable: true });
        bindPagination('results-paging', d.pagination.page, d.pagination.pages, loadResults);
    });
}


function loadSlowestResults() {
    hideAlert(['slowest-error', 'slowest-info']);
    showProgress('slowest-progress', 'slowest-load');

    var url = '/api/v1/runs/' + getRunId() + '/results/slowest?limit=20';
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('slowest-progress');

        if (e || d.error) {
            showAlert('slowest-error', null, (e || d.message));
            return;
        }

        clearTable('slowest');

        if (!d.results || d.results.length == 0) {
            showAlert('slowest-info', null, 'There are no results to display');
            return;
        }

        appendTableResultRows(d.results, 'slowest');
    });
}


function loadJustifier(page) {
    hideAlert(['justifier-error', 'justifier-info']);
    showProgress('justifier-progress', 'justifier-load');

    var url = '/api/v1/runs/' + getRunId() + '/results/justifier?limit=25&page=' + page;
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('justifier-progress');

        if (e || d.error) {
            showAlert('justifier-error', null, (e || d.message));
            return;
        }

        clearTable('justifier');

        if (!d.pagination.results || d.pagination.results.length == 0) {
            showAlert('justifier-info', null, 'There are no justified results to display');
            return;
        }

        appendTableResultRows(d.pagination.results, 'justifier', { expandable: true, jusifier: true });
        bindFixResults();
        bindPagination('justifier-paging', d.pagination.page, d.pagination.pages, loadJustifier);
    });
}