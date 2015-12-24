'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * UTILITIES
 */
function unique() {
    return 'x' + ++NOW + '' + +new Date();
}
function rnow() {
    return +new Date();
}

/**
 * NEXTORIGIN
 * ==========
 * var next_origin = nextorigin();
 */
var nextorigin = (function () {
    var max = 20,
        ori = Math.floor(Math.random() * max);
    return function (origin, failover) {
        return origin.indexOf('pubsub.') > 0 && origin.replace('pubsub', 'ps' + (failover ? generate_uuid().split('-')[0] : ++ori < max ? ori : ori = 1)) || origin;
    };
})();

/**
 * Build Url
 * =======
 *
 */
function build_url(url_components, url_params) {
    var url = url_components.join(URLBIT),
        params = [];

    if (!url_params) return url;

    each(url_params, function (key, value) {
        var value_str = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' ? JSON['stringify'](value) : value;
        typeof value != 'undefined' && value != null && encode(value_str).length > 0 && params.push(key + "=" + encode(value_str));
    });

    url += "?" + params.join(PARAMSBIT);
    return url;
}

/**
 * UPDATER
 * =======
 * var timestamp = unique();
 */
function updater(fun, rate) {
    var timeout,
        last = 0,
        runnit = function runnit() {
        if (last + rate > rnow()) {
            clearTimeout(timeout);
            timeout = setTimeout(runnit, rate);
        } else {
            last = rnow();
            fun();
        }
    };

    return runnit;
}

/**
 * GREP
 * ====
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
function grep(list, fun) {
    var fin = [];
    each(list || [], function (l) {
        fun(l) && fin.push(l);
    });
    return fin;
}

/**
 * SUPPLANT
 * ========
 * var text = supplant( 'Hello {name}!', { name : 'John' } )
 */
function supplant(str, values) {
    return str.replace(REPL, function (_, match) {
        return values[match] || _;
    });
}

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout(fun, wait) {
    return setTimeout(fun, wait);
}

/**
 * uuid
 * ====
 * var my_uuid = generate_uuid();
 */
function generate_uuid(callback) {
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
    if (callback) callback(u);
    return u;
}

function isArray(arg) {
    return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof arg.length === "number");
    //return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { } )
 */
function each(o, f) {
    if (!o || !f) return;

    if (isArray(o)) for (var i = 0, l = o.length; i < l;) {
        f.call(o[i], o[i], i++);
    } else for (var i in o) {
        o.hasOwnProperty && o.hasOwnProperty(i) && f.call(o[i], i, o[i]);
    }
}

/**
 * MAP
 * ===
 * var list = map( [1,2,3], function(item) { return item + 1 } )
 */
function map(list, fun) {
    var fin = [];
    each(list || [], function (k, v) {
        fin.push(fun(k, v));
    });
    return fin;
}

function pam_encode(str) {
    return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
}

/**
 * ENCODE
 * ======
 * var encoded_data = encode('path');
 */
function encode(path) {
    return encodeURIComponent(path);
}