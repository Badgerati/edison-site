
$(document).ready(function() {
    $('#current-run').click(function() {
        loadRunsForSelector('#current-run');
    });
    
    $('#previous-run').click(function() {
        loadRunsForSelector('#previous-run');
    });

    // bind select events
    bindSelectChange('project', loadRuns);
    bindSelectChange('computer', loadRuns);
    bindSelectChange('group', loadRuns);
});


function loadRunsForSelector(selector) {
    $('#run-select').data('selector', selector);
    loadRuns(1);
    $('#run-select').slideToggle();
}


function getCurrentRun() {
    return $('#current-run').data('id');
}


function getPreviousRun() {
    return $('#previous-run').data('id');
}


function areRunsSelected() {
    return (getCurrentRun() && getPreviousRun());
}


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

        appendTableRunRows({ runs: d.pagination.runs, table: '#runs', includeUrl: false });
        bindPagination('#runs-paging', d.pagination.page, d.pagination.pages, loadRuns);

        $('#runs tr.clickable').unbind().click(function() {
            var runName = $(this).find('td:nth(1)').text();
            var runId = $(this).data('id');
            var selector = $('#run-select').data('selector');

            $(selector).find('.panel-body .alert').removeClass('alert-warning').addClass('alert-success');
            $(selector).removeClass('panel-warning').addClass('panel-success');

            $(selector).data('id', runId);
            $(selector).find('.panel-body .alert').text(runName);

            $('#run-select').slideUp();

            // if both runs are selected, run a compare
            if (areRunsSelected()) {
                loadCompare();
                $('#compare-panel').slideDown();
            }
        });
    });
}


function loadCompare(page) {
    page = (page || 1);

    hideAlert(['compare-error', 'compare-info']);
    showProgress('compare-progress', '#compare-load');

    var url = '/api/v1/runs/' + getCurrentRun() + '/compare/' + getPreviousRun() + '?limit=25&page=' + page;
    doAjaxCall(url, 'get', null, (e, d) => {
        hideProgress('#compare-progress');

        if (e || d.error) {
            showAlert('compare-error', null, (e || d.message));
            return;
        }

        clearTable('#compare');

        if (!d.pagination.compare || d.pagination.compare.length == 0) {
            showAlert('compare-info', null, 'Both runs had identical results');
            return;
        }

        appendTableCompareRows({ compare: d.pagination.compare, table: '#compare' });
        bindPagination('#compare-paging', d.pagination.page, d.pagination.pages, loadCompare);
    });

}