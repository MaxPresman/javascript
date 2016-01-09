path = require("path");
assert = require("assert");
nockBack = require('nock').back;
//PUBNUB = require('../pubnub.js');

channel = "test_javascript_ssl";
origin = 'blah.pubnub.com';
uuid = "dd6af454-fa7a-47be-a800-1b9b050f5d94";
message = "hello";

nockBack.fixtures = __dirname + '/nockFixtures';
nockBack.setMode('lockdown');

var before = function(scope) {
  scope.filteringRequestBody = function(body, aRecordedBody) {
    if (typeof(body) !== 'string' || typeof(aRecordedBody) !== 'string') {
      return body;
    }

    var recordedBodyResult = /timestamp:([0-9]+)/.exec(aRecodedBody);
    if (!recodedBodyResult) {
      return body;
    }

    var recordedTimestamp = recodedBodyResult[1];
    return body.replace(/(timestamp):([0-9]+)/g, function(match, key, value) {
      return key + ':' + recordedTimestamp;
    });
  };
}

describe("When SSL mode", function () {

  /*
  beforeEach(function () {
    delete require.cache[require.resolve('../pubnub.js')];
    PUBNUB = require('../pubnub.js');
  });
  */


  describe("is enabled", function () {

    nockBack('subscribe_publish_443.json', function(nockDone) {
      it("should be able to successfully subscribe to the channel and publish message to it on port 443", function (done) {

        delete require.cache[require.resolve('../pubnub.js')];
        PUBNUB = require('../pubnub.js');

        var pubnub = PUBNUB.init({
          publish_key: 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
          subscribe_key: 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
          ssl: true,
          origin: origin,
          uuid: uuid
        });

        subscribeAndPublish(pubnub, channel + "_enabled_" + 10, function(err){
          nockDone();
          pubnub.shutdown();
          done(err);
        });
      });
    });

    nockBack('send_requests_via_443.json', function(nockDone) {
      it.skip("should send requests via HTTPS to 443 port", function (done) {

        delete require.cache[require.resolve('../pubnub.js')];
        PUBNUB = require('../pubnub.js');

        var pubnub = PUBNUB.init({
          publish_key: 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
          subscribe_key: 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
          ssl: true,
          origin: origin,
          uuid: uuid
        });

        pubnub.publish({
          channel: channel,
          message: message,
          callback: function () {
            nockDone();
            pubnub.shutdown();
            done();
          },
          error: function (err) {
            nockDone();
            pubnub.shutdown();
            done(new Error("Error callback triggered"));
          }
        });
      });
    });

  });

  describe("is disabled", function () {
    nockBack('subscribe_publish_80.json', function (nockDone) {
      it.skip("should be able to successfully subscribe to the channel and publish message to it on port 80", function (done) {

        delete require.cache[require.resolve('../pubnub.js')];
        PUBNUB = require('../pubnub.js');

        var pubnub = PUBNUB.init({
          publish_key: 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
          subscribe_key: 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
          ssl: false,
          origin: origin,
          uuid: uuid
        });

        subscribeAndPublish(pubnub, channel + "_disabled_" + 10, function (err) {
          nockDone();
          pubnub.shutdown();
          done(err);
        });
      });
    });

    nockBack('send_requests_via_80.json', function (nockDone) {
      it.skip("should send requests via HTTP to 80 port", function (done) {

        delete require.cache[require.resolve('../pubnub.js')];
        PUBNUB = require('../pubnub.js');

        var pubnub = PUBNUB.init({
          publish_key: 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
          subscribe_key: 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
          ssl: false,
          origin: origin,
          uuid: uuid
        });

        pubnub.publish({
          channel: channel,
          message: message,
          callback: function () {
            nockDone();
            pubnub.shutdown();
            done();
          },
          error: function () {
            nockDone();
            pubnub.shutdown();
            done(new Error("Error callback triggered"));
          }
        });
      });
    });

  });
});

function subscribeAndPublish(pubnub, channel, done) {
  pubnub.subscribe({
    channel: channel,
    connect: function () {
      pubnub.publish({
        channel: channel,
        message: message
      })
    },
    callback: function (msg, envelope, ch) {
      assert.equal(message, msg);
      assert.equal(channel, ch);
      done();
    },
    error: function (err) {
      console.log(err);
      done(new Error("Error callback triggered"));
    }
  });
}

function get_random(max) {
  return Math.floor((Math.random() * (max || 1000000000) + 1))
}
