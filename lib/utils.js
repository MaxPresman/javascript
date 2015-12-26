'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unique = unique;
exports.rnow = rnow;
exports.generateUUID = generateUUID;
exports.updater = updater;
exports.buildURL = buildURL;
exports.supplant = supplant;
exports.sugarTimeout = sugarTimeout;
exports.nextOrigin = nextOrigin;

var _uuid = require('uuid');

var uuid = _interopRequireWildcard(_uuid);

var _forEach = require('lodash/collection/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/*
    TODO: I have no idea how those origins are chosen, I suspect there might be a serious collision problems


    grep ====>>> _.filter
 */

var maxOrigin = 20;
var URLBIT = '/';
var PARAMSBIT = '&';
var REPL = /{([\w\-]+)}/g;

var NOW = 1;
var chosenOrigin = Math.floor(Math.random() * maxOrigin);

function encode(path) {
  return encodeURIComponent(path);
}

function unique() {
  return 'x' + ++NOW + '' + +new Date();
}

function rnow() {
  return +new Date();
}

function generateUUID(callback) {
  var u = uuid.v4();

  if (callback) {
    callback(u);
  }

  return u;
}

function updater(fun, rate) {
  var timeout = null;
  var last = 0;

  function runnit() {
    if (last + rate > rnow()) {
      clearTimeout(timeout);
      timeout = setTimeout(runnit, rate);
    } else {
      last = rnow();
      fun();
    }
  }

  return runnit;
}

function buildURL(urlComponents, urlParams) {
  var url = urlComponents.join(URLBIT);
  var params = [];

  if (!urlParams) {
    return url;
  }

  (0, _forEach2.default)(urlParams, function (key, value) {
    var valueStr = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON.stringify(value) : value;

    if (typeof value !== 'undefined' && value !== null && encode(valueStr).length > 0) {
      params.push(key + '=' + encode(valueStr));
    }
  });

  url += '?' + params.join(PARAMSBIT);
  return url;
}

function supplant(str, values) {
  return str.replace(REPL, function (_, match) {
    return values[match] || _;
  });
}

function sugarTimeout(fun, wait) {
  return setTimeout(fun, wait);
}

/* TODO: i have no idea what this function does */
function nextOrigin(origin, failOver) {
  // do not operate on non pubsub domains
  if (origin.indexOf('pubsub.') < 0) {
    return null;
  }

  var selectedOrigin = undefined;

  // we need to settle on a new origin
  if (failOver !== null) {
    selectedOrigin = failOver;
  } else {
    // bump up the chosenOrigin
    chosenOrigin = chosenOrigin + 1;

    if (chosenOrigin > maxOrigin) {
      chosenOrigin = 1;
    }

    selectedOrigin = chosenOrigin;
  }

  return origin.replace('pubsub', 'ps' + selectedOrigin);
}