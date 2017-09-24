
$(document).ready(function() {
    // bind select pickers for default value
    $('.selectpicker').each(function(index, item) {
        var value = $(item).attr('data-value');
        $(item).selectpicker();
        
        if (value) {
            $(item).selectpicker('val', value);
        }
    });

    // bind events on nav-tab bars
    $('ul.nav-tabs li').click(function(event) {
        var _this = $(this);
        var _content = _this.closest('.nav-tabs-content');
        var _active = _this.closest('ul.nav-tabs').find('li.active');

        // hide the currently active tab
        _active.removeClass('active');
        _content.find('#' + _active.attr('data-section')).addClass('hidden');

        // show the now focus tab
        _this.addClass('active');
        _content.find('#' + _this.attr('data-section')).removeClass('hidden');
    });

    // bind generic events
    bindGenericEvents();

    // auto generate text
    populatePlaceholders();
});


function bindGenericEvents() {
    $('.clickable-row').unbind().click(function() {
        window.location = $(this).data('href');
    });

    $('tr[data-id] span.history').unbind().click(function(e) {
        var testId = $(this).closest('tr[data-id]').data('test-id');
        window.location = '/tests/' + testId + '/history';
        e.stopPropagation();
    });
}


function bindExpandableRows() {
    $('tr.row-expandable').unbind().click(function(e) {
        var id = $(this).data('id');
        var element = $(this).parent('tbody').find('div[data-extra-id="' + id + '"]');

        if (!element) {
            return;
        }

        var hiddenParent = $(element).parent('td').parent('tr:hidden');
        var visibleParent = $(element).parent('td').parent('tr:visible');

        if (hiddenParent) {
            $(hiddenParent).show();
        }

        $(element).slideToggle('slow', () => {
            if (visibleParent) {
                $(visibleParent).hide();
            }
        });

        e.preventDefault();
    });
}


function scrollToTop() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}


function populatePlaceholders() {
    var date = moment().local();
    var year = date.format('YYYY');

    // double spaces
    $('span.space').html('&nbsp;&nbsp;');

    // current year
    $('span.year').html(year);

    // current year
    $('span.copy-year').html(year).attr('title', '2017 - ' + year);

    // about url
    $('span.about').html("<a href='/about' title='About'>About</a>");

    // support url
    $('span.support').html("<a href='https://github.com/Badgerati/edison-site/issues' title='Support'>Support and Bugs</a>");
}


function doAjaxCall(url, method, data, callback, form, submit, input, reverter) {
    $.ajax({
        url: url,
        type: method,
        data: data,
        success: function(data) {
            if (form || submit) {
                var _submit = submit || findSubmit(form);

                if (data.error) {
                    setFailure(_submit, 'Failed', 3000);

                    if (form) {
                        showAlert(data.errorKey, form, data.message, input);
                    }
                    
                    return;
                }

                if (input) {
                    $(input).val('').blur();
                }

                setSuccess(_submit, 'Success', 3000, reverter);
                hideAlert(null, form);
                unfocusSubmit(null, form);
            }

            if (callback) {
                if (data.error) {
                    console.log(data.error);
                }

                callback(null, data);
            }
        },
        error: function(err) {
            if (form || submit) {
                setFailure((submit || findSubmit(form)), 'Failed', 3000);

                if (form) {
                    showAlert((form ? null : 'error'), form, 'An unexpected has error occurred', input);
                }
            }

            if (callback) {
                if (err) {
                    console.log(err);
                }
                
                callback(err, null);
            }
        }
    });
}


function bindSelectChange(name, func) {
    if (!name || !func) {
        return;
    }

    $('select#' + name + '.selectpicker').on('change', () => func());
}


function bindRefreshToggle(func) {
    if (!func) {
        return;
    }

    $('#refresh-toggle').click(function() {
        $(this).toggleClass('btn-default').toggleClass('btn-success');

        if ($(this).hasClass('btn-success')) {
            var id = setInterval(func, 10000);
            $(this).data('interval-id', id);
        }
        else {
            clearInterval($(this).data('interval-id'));
            $(this).removeData('interval-id');
        }
    });
}


function getSubNavFilters() {
    return {
        project: getSelectOption('project', 'All', true),
        computer: getSelectOption('computer', 'All', true),
        group: getSelectOption('group', 'All', true)
    };
}


function getSelectOption(name, defaultValue, blankOnDefault) {
    if (!name) {
        return (defaultValue || '');
    }

    var value = $('select#' + name +'.selectpicker').selectpicker('val');

    if ((value == defaultValue) && blankOnDefault) {
        return '';
    }

    return (value || defaultValue || '');
}


function showProgress(name, location) {
    if (!name || !location) {
        return;
    }

    var html = 
        '<div id="' + name + '" class="progress">' +
            '<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>' +
        '</div>';
        
    $('#' + location).prepend(html);
}

function hideProgress(name) {
    if (!name) {
        return;
    }

    $('#' + name).remove();
}


function appendTableResultRows(results, table, opts) {
    if (!results || results.length == 0) {
        return;
    }

    opts = opts || { };

    var values = null;
    var comment = null;
    var duration = null;
    var dropdown = null;
    var dropdown_fix = null;
    var state = null;
    var fixed = false;

    results.forEach((v) => {
        fixed = v.is_fixed || v.state.toLowerCase() == 'success';
        comment = (v.comment ? v.comment.comment : '');
        duration = moment(v.duration).format('ss[s] SSS[ms]');

        // status labels
        switch (v.state.toLowerCase()) {
            case 'success':
                state = '<span class="label label-success">' + v.state + '</span>';
                break;

            case 'failure':
            case 'error':
                state = '<div class="label label-danger">' + v.state + '</div>';
                break;

            case 'inconclusive':
                state = '<span class="label label-warning">' + v.state + '</span>';
                break;

            case 'ignore':
                state = '<span class="label label-primary">' + v.state + '</span>';
                break;
        }

        // history results display slightly different data to normal ones
        if (opts.history) {
            values = [
                v.result.test.name,
                v.run.project.name,
                v.run.computer.name,
                v.run.group.name,
                state,
                moment(v.created_at).format('YYYY-MM-DD'),
                '<span class="glyphicon glyphicon-cog centre info mTop2 mRight8" aria-hidden="true"></span>'
            ];
        }
        else {
            values = [
                v.result.test.name,
                state,
                (fixed
                    ? '<span class="glyphicon glyphicon-ok centre status mTop2" aria-hidden="true"></span>'
                    : '<span class="glyphicon glyphicon-remove centre status mTop2" aria-hidden="true"></span>'),
                (opts.jusifier ? comment : duration),
                ('<span class="glyphicon glyphicon-cog centre info mTop2 mRight8" aria-hidden="true"></span>' +
                    '<span class="glyphicon glyphicon-search centre history mTop2" aria-hidden="true"></span>')
            ];
        }

        // add the row to the table
        var row = appendTableRow(table, values, v._id);
        $(row).data('test-id', v.result.test._id);

        // add the hidden table row for dropdown data (error message/stack trace)
        if (opts.expandable) {
            $(row).addClass('row-expandable').addClass('clickable');

            // create the fix/comment section for the dropdown
            if (fixed) {
                dropdown_fix =
                    '<div class="full-width no-side-padding mBottom10">' +
                        '<div class="input-group">' +
                            '<input type="text" class="form-control form-control-success op65" placeholder="No Comment" value="' + comment + '" disabled>' +
                            '<span class="input-group-btn">' +
                                '<button class="btn btn-success" type="button" disabled>Fixed</button>' +
                            '</span>' +
                        '</div>' +
                    '</div>'
            }
            else {
                dropdown_fix =
                    '<div class="full-width no-side-padding mBottom10">' +
                        '<div class="input-container">' +
                            '<div class="input-group">' +
                                '<input type="text" class="form-control" maxlength="500" placeholder="Comment...">' +
                                '<span class="input-group-btn">' +
                                    '<button class="btn btn-default fix-result" type="button">Fixed</button>' +
                                '</span>' +
                            '</div>' +
                            '<div class="meta">' +
                                '<div class="alert alert-danger hidden" role="alert"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
            }

            // create the expandable details
            dropdown =
                '<tr style="display: none">' +
                    '<td colspan="' + values.length + '">' +
                        '<div data-extra-id="' + v._id + '" class="well" style="display: none">' +
                            dropdown_fix +
                            '<h4 class="inline">Duration</h4><span>: ' + duration + '</span><br/>' +
                            '<h4 class="inline">Assembly</h4><span>: ' + v.result.test.assembly + '</span><br/>' +
                            '<h4 class="inline">Name Space</h4><span>: ' + v.result.test.namespace + '</span>' +
                            '<h4>Error Message</h4>' +
                            '<pre>' + v.result.error_message.message + '</pre>' +
                            '<h4>Stack Trace</h4>' +
                            '<pre>' + v.result.stack_trace.stacktrace + '</pre>' +
                        '</div>' +
                    '</td>' +
                '</tr>';

            // append them, ready for showing
            $(row).parent('tbody').append(dropdown);
        }
    });

    if (opts.expandable) {
        bindExpandableRows();
    }

    bindGenericEvents();
}


function appendTableRunRows(runs, table) {
    if (!runs || runs.length == 0) {
        return;
    }

    var values = null;
    var failedTests = 0;
    var failedStr = '';

    runs.forEach((v) => {
        failedTests = v.stats.total - v.stats.pass;
        failedStr = ' (<span class="fail">' + formatNumber(failedTests) + '</span>)'

        values = [
            (v.finished
                ? '<span class="glyphicon glyphicon-ok centre" aria-hidden="true"></span>'
                : '<span class="glyphicon glyphicon-hourglass centre" aria-hidden="true"></span>'),
            v.name,
            v.project.name,
            v.computer.name,
            (v.group.name || '-'),
            formatNumber(v.stats.total) + failedStr,
            '<span class="glyphicon glyphicon-time" aria-hidden="true"></span>' + moment(v.duration).format('HH[h] mm[m] ss[s]')
        ]

        var url = '/runs/' + v.id + '/results';
        var row = appendTableRow(table, values, v.id, url, true);
        $(row).addClass('clickable');
    });

    bindGenericEvents();
}


function appendTableRow(name, values, id, url, centreFirst) {
    if (!name || !values || values.length == 0) {
        return;
    }

    // build the row
    var _class = url ? 'class="clickable-row"' : '';
    var _href = url ? 'data-href="' + url + '"' : '';
    var row = '<tr data-id="' + (id || '') + '" ' + _class + ' ' + _href + '>';

    values.forEach((v, i) => {
        row += ('<td' + (centreFirst && i == 0 ? ' class="centre"' : '')  + '>' + v + '</td>')
    });

    row += '</tr>';

    // append the row to the table
    $('#' + name + ' tbody').append(row);

    // return the row that was just appened
    return id
        ? $('#' + name + ' tbody tr[data-id="' + id + '"]')
        : null;
}


function clearTable(name) {
    $('#' + name + ' tbody tr').remove();
}


function clearList(name) {
    $('#' + name + ' li').remove();
}


function setSuccess(button, message, timeout, reverter) {
    var _button = $(button);
    var html = _button.html();

    _button.removeClass('btn-default').addClass('btn-success');
    _button.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' + message);

    if (timeout) {
        setTimeout(function() {
            if (reverter) {
                reverter(_button);
            }
            else {
                _button.removeClass('btn-success').addClass('btn-default');
                _button.html(html);
            }
        }, timeout);
    }
}


function setFailure(button, message, timeout, reverter) {
    var _button = $(button);
    var html = _button.html();

    _button.removeClass('btn-default').addClass('btn-danger');
    _button.html('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ' + message);

    if (timeout) {
        setTimeout(function() {
            if (reverter) {
                reverter(_button);
            }
            else {
                _button.removeClass('btn-danger').addClass('btn-default');
                _button.html(html);
            }
        }, timeout);
    }
}


function showAlert(error, element, message, input, timeout) {
    message = (message.statusText || message);

    if (validator.isEmpty(message)) {
        return;
    }

    if (error && !error.startsWith('#')) {
        error = '#' + error;
    }
    else if (!error) {
        if (!element) {
            return;
        }

        error = $(element).find('.alert');
        if (!error || error.length == 0) {
            error = $(element).closest('div.input-container').find('.alert');
        }
    }

    if (!error) {
        return;
    }

    $(error).text(message);
    slideDown(error, timeout);

    // refocus the input box
    if (element) {
        unfocusSubmit(null, element);
    }

    if (input) {
        focusInput(input);
    }
}


function hideAlert(name, element, duration) {
    var doHide = function(name, form, duration) {
        if (name && !name.startsWith('#')) {
            name = '#' + name;
        }
        else if (!name) {
            if (!element) {
                return;
            }

            name = $(element).find('.alert');
            if (!name || name.length == 0) {
                name = $(element).closest('div.input-container').find('.alert');
            }
        }

        slideUp(name, duration);
    }

    // loop through name, or do single
    if (name instanceof Array) {
        name.forEach((v, i) => {
            doHide(v, element, (duration || 0));
        });
    }
    else {
        doHide(name, element, duration);
    }
}


function slideUp(element, duration) {
    var _element = $(element);

    if (_element && _element.is(':visible')) {
        if (duration == null) {
            _element.slideUp();
        }
        else {
            _element.slideUp(duration);
        }
    }
}


function slideDown(element, timeout) {
    var _element = $(element);

    if (_element && !_element.is(':visible')) {
        _element.hide().removeClass('hidden').slideDown();

        if (timeout) {
            setTimeout(function() {
                slideUp(element);
            }, timeout);
        }
    }
}


function unfocusSubmit(submit, form) {
    submit = submit || findSubmit(form);

    if (submit) {
        $(submit).blur();
    }
}


function focusInput(input) {
    if (!input) {
        return;
    }

    setTimeout(function() {
        $(input).focus();
    }, 100);
}


function findSubmit(form) {
    if (!form) {
        return null;
    }

    return $(form).find("[type='submit']");
}


function formatNumber(value)
{
    value += '';
    var split = value.split('.');
    var first = split[0];
    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(first)) {
        first = first.replace(rgx, '$1' + ',' + '$2');
    }

    var second = split.length > 1 ? '.' + split[1] : '';
    return first + second;
}


function disableElement(element) {
    $(element).attr('disabled', 'disabled');
}


function enableElement(element) {
    $(element).removeAttr('disabled');
}


function getCurrentPage(element) {
    return parseInt($('#' + element + ' li.active span').text());
}


function bindPagination(pagingId, current, total, action) {
    clearList(pagingId);

    for (var i = 1; i <= total; i++) {
        var link = (i == current)
            ? '<li class="active"><span>' + i + '</span></li>'
            : '<li><span>' + i + '</span></li>';
        $('#' + pagingId).append(link);
    }

    $('#' + pagingId + ' li').click(function() {
        if ($(this).hasClass('active')) {
            return;
        }

        $('#' + pagingId + ' li.active').toggleClass('active');
        $(this).toggleClass('active');

        action(getCurrentPage(pagingId));
        scrollToTop();
    });
}