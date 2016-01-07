var nockHarnessConfig = require("./harness/nock");

var PUBNUB = require('../pubnub.js'),
  assert = require("assert"),
  channel = "test_javascript_ssl",
  origin = 'blah.pubnub.com',
  uuid = "me",
  message = "hello";

describe("When SSL mode", function () {
  describe("is enabled", function () {
    // create a harness with the selected origin and enabled SSL
    var nockHarness = nockHarnessConfig(origin, true, "PubNub-JS-Nodejs/3.7.18", 'demo', 'demo');
    before(nockHarness.engage);
    after(nockHarness.disengage);

    it("should be able to successfully subscribe to the channel and publish message to it ", function (done) {
      var pubnub = PUBNUB.init({
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: true,
        origin: origin
      });

      subscribeAndPublish(pubnub, channel + "_enabled_" + get_random(), done);
    });

    it("should send requests via HTTPS to 443 port", function (done) {

      var pubnub = PUBNUB.init({
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: true,
        origin: origin,
        uuid: uuid
      });

      nockHarness.mockPublish(channel, encodeURI('"' + message + '"'), uuid, "ssl_test__send_requests_via_https.json");

      pubnub.publish({
        channel: channel,
        message: message,
        callback: function () {
          done();
        },
        error: function (err) {
          console.log(err);
          done(new Error("Error callback triggered"));
        }
      });
    });
  });

  describe.only("is disabled", function () {
    var nockHarness = nockHarnessConfig(origin, false, "PubNub-JS-Nodejs/3.7.18");
    before(nockHarness.engage);
    after(nockHarness.disengage);

    it.only("should be able to successfully subscribe to the channel and publish message to it ", function (done) {

      require('nock').recorder.rec();

      var pubnub = PUBNUB.init({
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: false,
        origin: origin
      });

      var subscribedChannel = channel + "_disabled_" + get_random();
      nockHarness.mockPublish(subscribedChannel, encodeURI('"' + message + '"'), uuid, "ssl_test__send_requests_via_https.json");
      nockHarness.mockSubscribe();

      subscribeAndPublish(pubnub, subscribedChannel, done);
    });

    it("should send requests via HTTP to 80 port", function (done) {

      var pubnub = PUBNUB.init({
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: false,
        origin: origin,
        uuid: uuid
      });

      nockHarness.mockPublish(channel, encodeURI('"' + message + '"'), uuid, "ssl_test__send_requests_via_http.json");

      pubnub.publish({
        channel: channel,
        message: message,
        callback: function () {
          done();
        },
        error: function () {
          done(new Error("Error callback triggered"));
        }
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
    }
  });
}

function get_random(max) {
  return Math.floor((Math.random() * (max || 1000000000) + 1))
}
