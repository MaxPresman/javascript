DEF_TIMEOUT = 15000 // MILLISECONDS

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout(fun, wait) {
    return setTimeout(fun, wait);
}

function crypto_obj() {

    function SHA256(s) {
        return CryptoJS['SHA256'](s)['toString'](CryptoJS['enc']['Hex']);
    }

    var iv = "0123456789012345";

    var allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
    var allowedKeyLengths = [128, 256];
    var allowedModes = ['ecb', 'cbc'];

    var defaultOptions = {
        'encryptKey': true,
        'keyEncoding': 'utf8',
        'keyLength': 256,
        'mode': 'cbc'
    };

    function parse_options(options) {

        // Defaults
        options = options || {};
        if (!options['hasOwnProperty']('encryptKey')) options['encryptKey'] = defaultOptions['encryptKey'];
        if (!options['hasOwnProperty']('keyEncoding')) options['keyEncoding'] = defaultOptions['keyEncoding'];
        if (!options['hasOwnProperty']('keyLength')) options['keyLength'] = defaultOptions['keyLength'];
        if (!options['hasOwnProperty']('mode')) options['mode'] = defaultOptions['mode'];

        // Validation
        if (allowedKeyEncodings['indexOf'](options['keyEncoding']['toLowerCase']()) == -1) options['keyEncoding'] = defaultOptions['keyEncoding'];
        if (allowedKeyLengths['indexOf'](parseInt(options['keyLength'], 10)) == -1) options['keyLength'] = defaultOptions['keyLength'];
        if (allowedModes['indexOf'](options['mode']['toLowerCase']()) == -1) options['mode'] = defaultOptions['mode'];

        return options;

    }

    function decode_key(key, options) {
        if (options['keyEncoding'] == 'base64') {
            return CryptoJS['enc']['Base64']['parse'](key);
        } else if (options['keyEncoding'] == 'hex') {
            return CryptoJS['enc']['Hex']['parse'](key);
        } else {
            return key;
        }
    }

    function get_padded_key(key, options) {
        key = decode_key(key, options);
        if (options['encryptKey']) {
            return CryptoJS['enc']['Utf8']['parse'](SHA256(key)['slice'](0, 32));
        } else {
            return key;
        }
    }

    function get_mode(options) {
        if (options['mode'] == 'ecb') {
            return CryptoJS['mode']['ECB'];
        } else {
            return CryptoJS['mode']['CBC'];
        }
    }

    function get_iv(options) {
        return (options['mode'] == 'cbc') ? CryptoJS['enc']['Utf8']['parse'](iv) : null;
    }

    return {

        'encrypt': function(data, key, options) {
            if (!key) return data;
            options = parse_options(options);
            var iv = get_iv(options);
            var mode = get_mode(options);
            var cipher_key = get_padded_key(key, options);
            var hex_message = JSON['stringify'](data);
            var encryptedHexArray = CryptoJS['AES']['encrypt'](hex_message, cipher_key, {'iv': iv, 'mode': mode})['ciphertext'];
            var base_64_encrypted = encryptedHexArray['toString'](CryptoJS['enc']['Base64']);
            return base_64_encrypted || data;
        },

        'decrypt': function(data, key, options) {
            if (!key) return data;
            options = parse_options(options);
            var iv = get_iv(options);
            var mode = get_mode(options);
            var cipher_key = get_padded_key(key, options);
            try {
                var binary_enc = CryptoJS['enc']['Base64']['parse'](data);
                var json_plain = CryptoJS['AES']['decrypt']({'ciphertext': binary_enc}, cipher_key, {'iv': iv, 'mode': mode})['toString'](CryptoJS['enc']['Utf8']);
                var plaintext = JSON['parse'](json_plain);
                return plaintext;
            }
            catch (e) {
                return undefined;
            }
        }
    };
}



/**
 * UTIL LOCALS
 */
var NOW        = 1
    ,    PNSDK      = 'PubNub-JS-' + "TEST" + '/' + "1.1.0";



/**
 * LOCAL STORAGE
 */
var db = (function(){
    var ls = typeof localStorage != 'undefined' && localStorage;
    return {
        get : function(key) {
            try {
                if (ls) return ls.getItem(key);
                if (document.cookie.indexOf(key) == -1) return null;
                return ((document.cookie||'').match(
                        RegExp(key+'=([^;]+)')
                    )||[])[1] || null;
            } catch(e) { return }
        },
        set : function( key, value ) {
            try {
                if (ls) return ls.setItem( key, value ) && 0;
                document.cookie = key + '=' + value +
                    '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
            } catch(e) { return }
        }
    };
})();


/**
 * BIND
 * ====
 * bind( 'keydown', search('a')[0], function(element) {
 *     ...
 * } );
 */
function bind( type, el, fun ) {
    each( type.split(','), function(etype) {
        var rapfun = function(e) {
            if (!e) e = window.event;
            if (!fun(e)) {
                e.cancelBubble = true;
                e.returnValue  = false;
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation();
            }
        };

        if ( el.addEventListener ) el.addEventListener( etype, rapfun, false );
        else if ( el.attachEvent ) el.attachEvent( 'on' + etype, rapfun );
        else  el[ 'on' + etype ] = rapfun;
    } );
}

/**
 * UNBIND
 * ======
 * unbind( 'keydown', search('a')[0] );
 */
function unbind( type, el, fun ) {
    if ( el.removeEventListener ) el.removeEventListener( type, false );
    else if ( el.detachEvent ) el.detachEvent( 'on' + type, false );
    else  el[ 'on' + type ] = null;
}

/**
 * ERROR
 * ===
 * error('message');
 */
function error(message) { console['error'](message) }

/**
 * EVENTS
 * ======
 * PUBNUB.events.bind( 'you-stepped-on-flower', function(message) {
 *     // Do Stuff with message
 * } );
 *
 * PUBNUB.events.fire( 'you-stepped-on-flower', "message-data" );
 * PUBNUB.events.fire( 'you-stepped-on-flower', {message:"data"} );
 * PUBNUB.events.fire( 'you-stepped-on-flower', [1,2,3] );
 *
 */
var events = {
    'list'   : {},
    'unbind' : function( name ) { events.list[name] = [] },
    'bind'   : function( name, fun ) {
        (events.list[name] = events.list[name] || []).push(fun);
    },
    'fire' : function( name, data ) {
        each(
            events.list[name] || [],
            function(fun) { fun(data) }
        );
    }
};

/**
 * ATTR
 * ====
 * var attribute = attr( node, 'attribute' );
 */
function attr( node, attribute, value ) {
    if (value) node.setAttribute( attribute, value );
    else return node && node.getAttribute && node.getAttribute(attribute);
}

/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) { return document.getElementById(id) }


/**
 * SEARCH
 * ======
 * var elements = search('a div span');
 */
function search( elements, start ) {
    var list = [];
    each( elements.split(/\s+/), function(el) {
        each( (start || document).getElementsByTagName(el), function(node) {
            list.push(node);
        } );
    } );
    return list;
}

/**
 * CSS
 * ===
 * var obj = create('div');
 */
function css( element, styles ) {
    for (var style in styles) if (styles.hasOwnProperty(style))
        try {element.style[style] = styles[style] + (
                '|width|height|top|left|'.indexOf(style) > 0 &&
                typeof styles[style] == 'number'
                    ? 'px' : ''
            )}catch(e){}
}

/**
 * CREATE
 * ======
 * var obj = create('div');
 */
function create(element) { return document.createElement(element) }


function get_hmac_SHA256(data,key) {
    var hash = CryptoJS['HmacSHA256'](data, key);
    return hash.toString(CryptoJS['enc']['Base64']);
}

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

function CREATE_PUBNUB(setup) {

    mainJs = require("../lib/main.js")

    setup['db'] = db;
    setup['error'] = setup['error'] || error;
    setup['hmac_SHA256']= get_hmac_SHA256;
    setup['crypto_obj'] = crypto_obj();
    setup['params']      = { 'pnsdk' : PNSDK }

    SELF = function(setup) {
        return CREATE_PUBNUB(setup);
    }
    var PN = mainJs.PN_API(setup);
    for (var prop in PN) {
        if (PN.hasOwnProperty(prop)) {
            SELF[prop] = PN[prop];
        }
    }

    SELF['init'] = SELF;
    SELF['$'] = $;
    SELF['attr'] = attr;
    SELF['search'] = search;
    SELF['bind'] = bind;
    SELF['css'] = css;
    SELF['create'] = create;
    SELF['crypto_obj'] = crypto_obj();

    if (typeof(window) !== 'undefined'){
        bind( 'beforeunload', window, function() {
            SELF['each-channel'](function(ch){ SELF['LEAVE']( ch.name, 1 ) });
            return true;
        });
    }

    // Return without Testing
    if (setup['notest']) return SELF;

    if (typeof(window) !== 'undefined'){
        bind( 'offline', window,   SELF['_reset_offline'] );
    }

    if (typeof(document) !== 'undefined'){
        bind( 'offline', document, SELF['_reset_offline'] );
    }

    SELF['ready']();
    return SELF;
}
CREATE_PUBNUB['init'] = CREATE_PUBNUB
CREATE_PUBNUB['secure'] = CREATE_PUBNUB
CREATE_PUBNUB['crypto_obj'] = crypto_obj()
PUBNUB = CREATE_PUBNUB({})
typeof module  !== 'undefined' && (module.exports = CREATE_PUBNUB) ||
typeof exports !== 'undefined' && (exports.PUBNUB = CREATE_PUBNUB) || (PUBNUB = CREATE_PUBNUB);


pubnub = PUBNUB({
    publish_key   : 'demo',
    subscribe_key : 'demo'
})

/*
console.log("Subscribing..");
pubnub.subscribe({
    channel : "hello_world",
    message : function(message,env,ch,timer,magic_ch){
        console.log(
            "Message Received." + '<br>' +
            "Channel: " + ch + '<br>' +
            "Message: " + JSON.stringify(message)  + '<br>' +
            "Raw Envelope: " + JSON.stringify(env) + '<br>' +
            "Magic Channel: " + JSON.stringify(magic_ch)
        )},
    connect: pub
})

function pub() {
    console.log("Since we’re publishing on subscribe connectEvent, we’re sure we’ll receive the following publish.");
    pubnub.publish({
        channel : "hello_world",
        message : "Hello from PubNub Docs!",
        callback: function(m){ console.log(m) }
    })
}
*/