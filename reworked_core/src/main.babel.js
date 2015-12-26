import {HeartBeat} from './heartbeat';
import {Networking} from './networking';

const uuid = require('uuid');


export class PubNub {

    constructor() {
        //generate constants
        this.UUID = uuid.v4();

        //initialize dependent services.
        this.networking = new Networking({UUID});
        this.heartbeat = new HeartBeat({
            networking: this.networking,
            onConnect: this.onConnection,
            onDisconnect: this.onDisconnect
        });

        console.log("helllllooo");
    }


    onConnection() {

    }

    onDisconnect() {

    }

}