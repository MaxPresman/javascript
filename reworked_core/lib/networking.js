'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.performHTTP = performHTTP;
var URLBIT = '/';

var superAgent = require('superAgent');
var queryString = require('query-string');

var _isEmpty = require('lodash/lang/isEmpty');

function performHTTP(setup) {
    var payload = constructPayload(setup);
    var url = build_url(setup.url, payload);

    var onSuccess = setup.success;
    var onFail = setup.fail;

    console.log(url);

    superAgent.get(url).buffer(true).on('error', onFail).end(function (err, response) {
        var parsedText = JSON.parse(response.text);
        console.log(parsedText);
        onSuccess(parsedText);
    });
}

function constructPayload(rawPayload) {
    var data = rawPayload.data;

    return data;
}

/**
 * Build Url
 * =======
 *
 */
function build_url(url_components, url_params) {
    var url = url_components.join(URLBIT);

    if (!_isEmpty(url_params)) {
        url += "?" + queryString.stringify(url_params);
    }

    return url;
}