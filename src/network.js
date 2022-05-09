// (c) 1997 FetchBot

import Peer from "peerjs";

class NetworkHandler extends EventTarget{

  constructor(config) {
    super();
    this.queue = [];
    this.lastPackedCache = Object.create(null);
    this.hasScheduledPush = false;
    this.alwaysSendTypes = [];
    this.onRecievePacket = Object.create(null);
    this.connection = null;
    this.peer = null;
    this.peerID = null;
    this.config = config;
  }

  isOpen() {
    return !!this.peer;
  }

  hasConnection() {
    return !!this.connection;
  }

  open() {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(this.config);
  
      this.peer.on("open", (id) => {
        this.peerID = id;
        this.dispatchEvent(new CustomEvent("open",{
            detail:id
        }));
        resolve(id);
      });
  
      this.peer.on("connection", (connection) => {
        this.connection = connection;
        this.dispatchEvent(new CustomEvent("connection",{
            detail:{
                side:"incoming"
            }
        }));
  
        this.connection.on("data", this.reciveData.bind(this));
      });
    });
  }
  on(packetType, callback) {
    (this.onRecievePacket[packetType] =
      this.onRecievePacket[packetType] ?? []).push(callback);
  }

  send(packetType, payload) {
    const data = JSON.stringify([packetType, payload]);

    if (
      !this.alwaysSendTypes.includes(packetType) &&
      packetType in this.lastPackedCache &&
      data === this.lastPackedCache[packetType]
    )
      return;
    
    this.lastPackedCache[packetType] = data;
    if (!this.hasScheduledPush) {
      this.hasScheduledPush = true;
      queueMicrotask(() => {
        this.emit(`[${this.queue.join()}]`);
        this.queue = [];
        this.hasScheduledPush = false;
      });
    }

    this.queue.push(data);
  }
  reciveData(data) {
    /**
     * @type {[string,any][]}
     */
    const packets = JSON.parse(data);
    let threw = false;
    for (const packet of packets) {
      const [packetType, packetData] = packet;

      if (packetType in this.onRecievePacket) {
        this.onRecievePacket[packetType].forEach((cb) => cb(packetData));
      } 
      // this newline is here because saricden asked for it, fetchbot is against this new line being here.
      //there_is_no_space_at_the_start_of_this_comment_because_fetchbot_does_not_have_time_for_spaces
      // this comment is absurdly long because 
      else {
        threw = true;
        console.error(
          `recieved unknown packet type, "${packetType}"`,
          packetData
        );
      }
    }
    if (threw)
      throw new Error("recieved bad packet (see above for more info).");
  };

  emit(data) {
    this.connection.send(data);
  }

  connectTo(remotePeerID) {
    return new Promise((resolve, reject) => {
      if (this.connection === null) {
        this.connection = this.peer.connect(remotePeerID);
        
        this.dispatchEvent(new CustomEvent("connection",{
            detail:{
                side:"outgoing"
            }
        }));
  
        this.connection.on("data", this.reciveData.bind(this));
  
        return true;
      }
  
      return false;
    });
  }
}

export const network = new NetworkHandler({
  host: "farzone-server.herokuapp.com",
  port: 443,
  secure: true,
  // debug: 3
  debug: 0,
});
globalThis.test = network;
console.log("NETWORK HANDLER",network)