PUBNUB = require('../lib/main')


pubnub = PUBNUB({
    publish_key   : 'demo',
    subscribe_key : 'demo'
})

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