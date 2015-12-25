'use strict';

const URLBIT = '/';
const superAgent = require('superAgent');
const _merge = require('lodash/object/merge');


export function getServerTime(uuid, authKey, instanceId, params, cb) {
    var data = {uuid, 'auth': authKey};

    if (params != null){
        _merge(data, params);
    }

    if (instanceId != null){
        data['instanceid'] = instanceId
    }

    console.log(data);

    performHTTP({
        data,
        url      : [STD_ORIGIN, 'time', jsonp],
        success  : function(response) { cb(response[0]) },
        fail     : function() { cb(0) }
    });

}

/*
'time' : function(callback) {
    var jsonp = jsonp_cb();

    var data = { 'uuid' : UUID, 'auth' : AUTH_KEY }

    if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

    networking.performHTTP({
        callback : jsonp,
        data     : _get_url_params(data),
        url      : [STD_ORIGIN, 'time', jsonp],
        success  : function(response) { callback(response[0]) },
        fail     : function() { callback(0) }
    });
},
*/

export function performHTTP(setup) {
    var payload = constructPayload(setup);
    const url = build_url(setup.url, payload);

    var {success: onSuccess, fail: onFail} = setup;

    superAgent
        .get(url)
        .buffer(true)
        .query(payload)
        .on('error', onFail)
        .end((err, response) => {
            var parsedText = JSON.parse(response.text);
            console.log(parsedText);
            console.log(response.request.host, response.req.path)
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
function build_url(url_components) {
    return url_components.join(URLBIT);
}
