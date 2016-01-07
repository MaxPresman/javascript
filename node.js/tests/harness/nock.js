var nock = require("nock");

// this is dying for ES6
function nockHarness(hostname, isSSL, pnsdk, publishKey, subscribeKey) {
  var nockInstance;
  var timeTick = 1;

  return {
    engage: function() {
      var resolvedPath;
      var pubnubPath;

      if (isSSL){
        resolvedPath = "https://" + hostname + ":443";
      } else {
        resolvedPath = "http://" + hostname + ":80";
      }

      nock.disableNetConnect();

      nockInstance = nock(resolvedPath).log(console.log);

      nockInstance.get('/time/0')
        .query(true)
        .reply(function(){
          var oldTick = timeTick;
          timeTick = timeTick + 1;
          return oldTick;
        });

    },

    mockPublish: function(channelName, message, uuid, jsonFile){
      nockInstance
        .get("/publish/" + publishKey + "/" + subscribeKey + "/0/" + channelName +  "/0/" + message)
        .query({uuid: uuid, pnsdk: pnsdk})
        .replyWithFile(200, __dirname + '/../stubs/' + jsonFile);
    },

    mockSubscribe: function(channelName, tick, jsonFile){
      nockInstance
        .get("/subscribe/" + subscribeKey + "/" + channelName + "/0/" + tick)
        .query(true)
        .replyWithFile(200, __dirname + '/../stubs/' + jsonFile);
    },

    disengage: function() {
      nock.enableNetConnect();
      nock.restore();
    }
  };

}

module.exports = nockHarness;

/*
module.exports = {
  engage: function(){
    __engageWithPort(80);
  },

  engageWithSSL: function(){
    __engageWithPort(443);
  },

  disengage: function(){
    nock.enableNetConnect();
  }

};

__engageWithPort = function(port){
  nock.disableNetConnect();
  console.log("yes, hellllooo in SSL", port);
}
*/