path = require("path");
assert = require("assert");
_ = require('underscore');
nock = require('nock');

nock.back.fixtures = path.join(__dirname, "fixtures", "ssl_test");
console.log(process.env.NOCK_BACK_MODE);
nock.back.setMode(process.env.NOCK_BACK_MODE);

function getRandom(max) {
  return Math.floor((Math.random() * (max || 1000000000) + 1))
}

function getTestUUID() {
  if ((_.contains(["wild", "dryrun", "record", "lockdown"], process.env.NOCK_BACK_MODE))) {
    return "dd6af454-fa7a-47be-a800-1b9b050f5d94"
  } else {
    return require('node-uuid').v4()
  }
}

function getChannelPostFix() {
  if ((_.contains(["wild", "dryrun", "record", "lockdown"], process.env.NOCK_BACK_MODE))) {
    return 10
  } else {
    return getRandom()
  }
}

function requireUncached(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

describe("When SSL mode", function () {
  var testFixtures = {};
  var caseFixtures = {};

  before(function () {
    testFixtures.channel = "test_javascript";
    testFixtures.origin = 'blah.pubnub.com';
    testFixtures.uuid = getTestUUID();
    testFixtures.message = "hello";
    testFixtures.publishKey = 'pub-c-82c13e30-f521-4419-b002-b8c99d5faa00';
    testFixtures.subscribeKey = 'sub-c-7756fcc2-9bd6-11e5-b0f3-02ee2ddab7fe';
  });

  nock.back("with_ssl.json", function(nockDone) {
    describe("is enabled", function () {
      beforeEach(function () {
        caseFixtures.pubnub = requireUncached("../pubnub.js").init({
          publish_key: testFixtures.publishKey,
          subscribe_key: testFixtures.subscribeKey,
          ssl: true,
          origin: testFixtures.origin,
          uuid: this.currentTest.title
        });
      });

      afterEach(function () {
        console.log("calling shutdown on", this.currentTest.title);
        caseFixtures.pubnub.shutdown();
        caseFixtures = {};
      });

      after(function () {
        nockDone();
        nock.cleanAll();
      });

      it("t1", function (done) {
        subscribeAndPublish(caseFixtures.pubnub, testFixtures.channel + "_enabled_ssl" + getChannelPostFix(), testFixtures.message, function (err) {
          done(err);
        });
      });

      it("t2", function (done) {
        caseFixtures.pubnub.publish({
          channel: testFixtures.channel,
          message: testFixtures.message,
          callback: function () {
            done();
          },
          error: function (err) {
            done(new Error("Error callback triggered"));
          }
        });
      });
    });
  });

  nock.back("without_ssl.json", function(nockDone) {
    describe("is disabled", function () {

      beforeEach(function () {
        caseFixtures.pubnub = requireUncached("../pubnub.js").init({
          publish_key: testFixtures.publishKey,
          subscribe_key: testFixtures.subscribeKey,
          ssl: false,
          origin: testFixtures.origin,
          uuid: this.currentTest.title
        });
      });

      afterEach(function () {
        caseFixtures.pubnub.shutdown();
        caseFixtures = {};
      });

      after(function () {
        nockDone();
        nock.cleanAll();
      });

      it("t3", function (done) {
        subscribeAndPublish(caseFixtures.pubnub, testFixtures.channel + "_disabled_" + getChannelPostFix(), testFixtures.message, function (err) {
          done(err);
        });
      });

      it("t4", function (done) {
        caseFixtures.pubnub.publish({
          channel: testFixtures.channel,
          message: testFixtures.message,
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
});

function subscribeAndPublish(pubnub, channel, message, done) {
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
      //done(new Error("Error callback triggered"));
    }
  });
}
