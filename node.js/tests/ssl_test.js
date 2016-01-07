path = require("path");


var PUBNUB = require('../pubnub.js'),
  assert = require("assert"),
  channel = "test_javascript_ssl",
  origin = 'blah.pubnub.com',
  uuid = "dd6af454-fa7a-47be-a800-1b9b050f5d94",
  message = "hello";

describe("When SSL mode", function () {
  var nockFixtureDirectory = path.resolve(__dirname, './fixtures');
  console.log(nockFixtureDirectory);
  var nockBackMocha = require('nock-back-mocha')(nockFixtureDirectory);
  beforeEach(nockBackMocha.beforeEach);
  afterEach(nockBackMocha.afterEach);

  describe("is enabled", function () {
    it("should be able to successfully subscribe to the channel and publish message to it on port 443", function (done) {
      var pubnub = PUBNUB.init({
        publish_key     : 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
        subscribe_key   : 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
        ssl: true,
        origin: origin,
        uuid: uuid
      });

      subscribeAndPublish(pubnub, channel + "_enabled_" + 10, done);
    });

    it("should send requests via HTTPS to 443 port", function (done) {
      var pubnub = PUBNUB.init({
        publish_key     : 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
        subscribe_key   : 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
        ssl: true,
        origin: origin,
        uuid: uuid
      });

      pubnub.publish({
        channel: channel,
        message: message,
        callback: function () {
          pubnub.shutdown();
          done();
        },
        error: function (err) {
          pubnub.shutdown();
          done(new Error("Error callback triggered"));
        }
      });
    });
  });

  describe("is disabled", function () {
    it("should be able to successfully subscribe to the channel and publish message to it on port 80", function (done) {
        var pubnub = PUBNUB.init({
          publish_key     : 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
          subscribe_key   : 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
          ssl             : false,
          origin          : origin,
          uuid: uuid
        });

        subscribeAndPublish(pubnub, channel + "_disabled_" + 10, done);
    });

    it("should send requests via HTTP to 80 port", function (done) {
      var pubnub = PUBNUB.init({
        publish_key     : 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00',
        subscribe_key   : 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe',
        ssl: false,
        origin: origin,
        uuid: uuid
      });

      pubnub.publish({
        channel: channel,
        message: message,
        callback: function () {
          pubnub.shutdown();
          done();
        },
        error: function () {
          pubnub.shutdown();
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
      pubnub.shutdown();
      done();
    },
    error: function (err) {
      pubnub.shutdown();
      done(new Error("Error callback triggered"));
    }
  });
}

function get_random(max) {
  return Math.floor((Math.random() * (max || 1000000000) + 1))
}
