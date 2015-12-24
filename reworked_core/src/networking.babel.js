'use strict';

const URLBIT = '/';

const superAgent = require('superAgent');
const queryString = require('query-string');

const _isEmpty = require('lodash/lang/isEmpty');

export function performHTTP(setup) {
    var payload = constructPayload(setup);
    const url = build_url(setup.url, payload);

    var {success: onSuccess, fail: onFail} = setup;

    console.log(url)

    superAgent
        .get(url)
        .buffer(true)
        .on('error', onFail)
        .end((err, response) => {
            var parsedText = JSON.parse(response.text);
            console.log(parsedText);
            onSuccess(parsedText);
        });
}

function constructPayload(rawPayload) {
    var {data} = rawPayload;
    return data
}

/**
 * Build Url
 * =======
 *
 */
function build_url( url_components, url_params ) {
    var url = url_components.join(URLBIT);

    if (!_isEmpty(url_params)){
        url += "?" + queryString.stringify(url_params)
    }

    return url;
}
