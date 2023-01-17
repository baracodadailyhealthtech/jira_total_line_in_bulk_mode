// ==UserScript==
// @name         total line
// @namespace    http://tampermonkey.net/
// @downloadURL  https://github.com/com:baracodadailyhealthtech/jira_total_line_in_bulk_mode/raw/master/script.user.js
// @updateURL    https://github.com/com:baracodadailyhealthtech/jira_total_line_in_bulk_mode/raw/master/script.user.js
// @version      0.1
// @description  append total line to footer of bulk mode for estimates
// @author       https://github.com/okolovmark
// @match        https://baracoda.atlassian.net/secure/views/bulkedit/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @grant        none
// @require https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function() {
    'use strict';

    jQuery(document).ready(function() {
    // Perform initial calculation on page load.
    addTotalFooterJQL();

    // Monitor .navigator-content for changes.
    // When #issuetable is rewritten, recalculate estimates footer.
    var oldTable = jQuery("#issuetable").get(0);
    jQuery(".navigator-content").bind('DOMSubtreeModified', function(e) {
        var newTable = jQuery("#issuetable").get(0);
        if (newTable !== oldTable) {
            oldTable = newTable;
            addTotalFooterJQL();
        }
    });
});

function addTotalFooterJQL() {
    // Clone last row and clean it from content
    var resultRow = jQuery("#issuetable");
    var resultLastRow = resultRow.find(".issuerow:last").clone();
    resultLastRow.find("td").html("");
    // Calculate sums for the estimate columns
    resultLastRow.find(".timeoriginalestimate").html(formatEstimate(sumMinutes(resultRow.find(".timeoriginalestimate"))));
    resultLastRow.find(".timeestimate").html(formatEstimate(sumMinutes(resultRow.find(".timeestimate"))));
    resultLastRow.find(".timespent").html(formatEstimate(sumMinutes(resultRow.find(".timespent"))));
    resultLastRow.find(".issuekey").html(sumCount(resultRow.find(".issuekey")));
    resultLastRow.find(".customfield_10891").html(sumQuoted(resultRow.find(".customfield_10891")));
    resultLastRow.find(".customfield_10895").html(sumTshirt(resultRow.find(".customfield_10895")));


    var footer = jQuery("<tfoot></tfoot>").append(resultLastRow);
    jQuery("#issuetable").append(footer);
}

function formatEstimate(minutes) {
    if (minutes < 60) {
        return minutes + " minutes";
    }

    var hours = minutes / 60;
    return roundTo(hours, 1) + " hours";
}

function roundTo(number, decimals) {
    var pow = Math.pow(10, decimals);
    return Math.round(number*pow) / pow;
}

function sumMinutes(field) {
    var minutes = 0;
    field.each(function(key,val) {
        var time = jQuery(val).text();
        if (time) {
            minutes += parseToMinutes(time);
        }
    });

    return minutes;
}

function sumQuoted(field) {
    var total = 0;
    for (var i = 0; i < field.length; i++) {
        var v = field[i].innerText;
        if (v) {
            total += parseFloat(v);
        }
    }
    return total + " hours";
}

function sumCount(field) {
    return field.length + " tickets";
}

function parseToMinutes(timeStr) {
    var times = timeStr.split(",") ;
    var rtrn = 0;
    for (var i = 0; i < times.length; i++) {
        var time = times[i];
        var match;
        if ((match = /([0-9]+)\s*minutes?/.exec(time))) {
            rtrn+=parseInt(match[1], 10);
        }
        else if ((match = /([0-9]+)\s*hours?/.exec(time))) {
            rtrn+=parseInt(match[1]*60);
        }
        else if ((match = /([0-9]+)\s*days?/.exec(time))) {
            rtrn+=parseInt(match[1]*8*60);
        }
        else if ((match = /([0-9]+)\s*weeks?/.exec(time))) {
            rtrn+=parseInt(match[1]*8*60*5);
        }
        else {
            throw ("The string didn't match" + timeStr);
        }
    }
    return rtrn;
}

    function sumTshirt(times) {
    var rtrn = 0;
    for (var i = 0; i < times.length; i++) {
        var time = times[i].innerText.replace(/\s/g, '');
        var match;
        if ((match = /^XXS$/.exec(time))) {
            rtrn+=1;
        }
        else if ((match = /^XS$/.exec(time))) {
            rtrn+=4;
        }
        else if ((match = /^S$/.exec(time))) {
            rtrn+=8;
        }
        else if ((match = /^M$/.exec(time))) {
            rtrn+=24;
        }
        else if ((match = /^L$/.exec(time))) {
            rtrn+=40;
        }
        else if ((match = /^XL$/.exec(time))) {
            rtrn+=80;
        }
        else if ((match = /^XXL$/.exec(time))) {
            rtrn+=120;
        }
        else if ((match = /^$/.exec(time))) {
            rtrn+=0;
        }
        else if ((match = /^\?$/.exec(time))) {
            rtrn+=0;
        }
        else {
            throw ("The string didn't match" + times);
        }
    }
    return rtrn / 8 + " days";
}
})();

