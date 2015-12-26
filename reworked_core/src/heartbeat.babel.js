


export class HeartBeat {

    constructor({networking, onConnect, onDisconnect}){
        this.networking = networking;
        this.onConnect = onConnect;
        this.onDisconnect = onDisconnect;

        // assume that we are in a disconnected state when the class initializes.
        this.connected = false;
    }

    startPolling(){

    }

    stopPolling(){

    }
}