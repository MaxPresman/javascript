'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getServerTime = getServerTime;
exports.performHTTP = performHTTP;
var URLBIT = '/';
var superAgent = require('superAgent');
var _merge = require('lodash/object/merge');

function getServerTime(uuid, authKey, instanceId, params, cb) {
    var data = { uuid: uuid, 'auth': authKey };

    if (params != null) {
        _merge(data, params);
    }

    if (instanceId != null) {
        data['instanceid'] = instanceId;
    }

    console.log(data);

    performHTTP({
        data: data,
        url: [STD_ORIGIN, 'time', jsonp],
        success: function success(response) {
            cb(response[0]);
        },
        fail: function fail() {
            cb(0);
        }
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

function performHTTP(setup) {
    var payload = constructPayload(setup);
    var url = build_url(setup.url, payload);

    var onSuccess = setup.success;
    var onFail = setup.fail;

    superAgent.get(url).buffer(true).query(payload).on('error', onFail).end(function (err, response) {
        var parsedText = JSON.parse(response.text);
        console.log(parsedText);
        console.log(response.request.host, response.req.path);
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
function build_url(url_components) {
    return url_components.join(URLBIT);
}