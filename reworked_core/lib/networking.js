'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.doWork = doWork;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var URLBIT = '/';
var PARAMSBIT = '&';

var request = require('request');

function doWork(setup) {
    var payload = constructPayload(setup);
    var url = build_url(setup.url, payload);

    console.log(url);

    request.get(url).on("response", function (data) {
        return console.log("data", data);
    });

    console.log(setup);
    console.log("hello");
}

function constructPayload(setup) {
    console.log(setup);
    return {};
}

/**
 * Build Url
 * =======
 *
 */
function build_url(url_components, url_params) {
    var url = url_components.join(URLBIT),
        params = [];

    if (!url_params) return url;

    url_params.forEach(function (key, value) {
        var value_str = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' ? JSON['stringify'](value) : value;
        typeof value != 'undefined' && value != null && encode(value_str).length > 0 && params.push(key + "=" + encode(value_str));
    });

    url += "?" + params.join(PARAMSBIT);
    return url;
}

/**
 * CORS XHR Request
 * ================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
function xdr( setup ) {

    request = require('request')
    console.log(setup);
    // console.log(request);

     var xhr
     ,   finished = function() {
     if (loaded) return;
     loaded = 1;

     clearTimeout(timer);

     try       { response = JSON['parse'](xhr.responseText); }
     catch (r) { return done(1); }

     success(response);
     }
     ,   complete = 0
     ,   loaded   = 0
     ,   xhrtme   = setup.timeout || DEF_TIMEOUT
     ,   timer    = timeout( function(){done(1)}, xhrtme )
     ,   data     = setup.data || {}
     ,   fail     = setup.fail    || function(){}
     ,   success  = setup.success || function(){}
     ,   async    = ( typeof(setup.blocking) === 'undefined' )
     ,   done     = function(failed, response) {
     if (complete) return;
     complete = 1;

     clearTimeout(timer);

     if (xhr) {
     xhr.onerror = xhr.onload = null;
     xhr.abort && xhr.abort();
     xhr = null;
     }

     failed && fail(response);
     };

     // Send
     try {
     xhr = typeof XDomainRequest !== 'undefined' &&
     new XDomainRequest()  ||
     new XMLHttpRequest();

     xhr.onerror = xhr.onabort   = function(){ done(1, xhr.responseText || { "error" : "Network Connection Error"}) };
     xhr.onload  = xhr.onloadend = finished;
     xhr.onreadystatechange = function() {
     if (xhr.readyState == 4) {
     switch(xhr.status) {
     case 200:
     break;
     default:
     try {
     response = JSON['parse'](xhr.responseText);
     done(1,response);
     }
     catch (r) { return done(1, {status : xhr.status, payload : null, message : xhr.responseText}); }
     return;
     }
     }
     }
     data['pnsdk'] = PNSDK;
     url = build_url(setup.url, data);
     xhr.open( 'GET', url, async);
     if (async) xhr.timeout = xhrtme;
     xhr.send();
     }
     catch(eee) {
     done(0);
     return xdr(setup);
     }

     // Return 'done'
     return done;

}*/