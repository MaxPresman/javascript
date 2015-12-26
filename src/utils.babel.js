import * as uuid from 'uuid';
import _each from 'lodash/collection/forEach';

/*
    TODO: I have no idea how those origins are chosen, I suspect there might be a serious collision problems


    grep ====>>> _.filter
 */

const maxOrigin = 20;
const URLBIT = '/';
const PARAMSBIT = '&';
const REPL = /{([\w\-]+)}/g;

let NOW = 1;
let chosenOrigin = Math.floor(Math.random() * maxOrigin);

function encode(path) {
  return encodeURIComponent(path);
}

export function unique() {
  return 'x' + ++NOW + '' + (+new Date);
}

export function rnow() {
  return +new Date;
}

export function generateUUID(callback) {
  const u = uuid.v4();

  if (callback) {
    callback(u);
  }

  return u;
}

export function updater(fun, rate) {
  let timeout = null;
  let last = 0;

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

export function buildURL(urlComponents, urlParams) {
  let url = urlComponents.join(URLBIT);
  const params = [];

  if (!urlParams) {
    return url;
  }

  _each(urlParams, (key, value) => {
    const valueStr = (typeof value === 'object') ? JSON.stringify(value) : value;

    if (typeof value !== 'undefined' && value !== null && encode(valueStr).length > 0) {
      params.push(key + '=' + encode(valueStr));
    }
  });

  url += '?' + params.join(PARAMSBIT);
  return url;
}


export function supplant(str, values) {
  return str.replace(REPL, (_, match) => {
    return values[match] || _;
  });
}

export function sugarTimeout(fun, wait) {
  return setTimeout(fun, wait);
}


/* TODO: i have no idea what this function does */
export function nextOrigin(origin, failOver) {
  // do not operate on non pubsub domains
  if (origin.indexOf('pubsub.') < 0) {
    return null;
  }

  let selectedOrigin;

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

export function pamEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*~]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
