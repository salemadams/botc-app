import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import { io, Socket } from "socket.io-client";
import API from "../config/api";
export default class SocketIoClient extends EventEmitter {
  socket?: Socket;
  constructor() {
    super();
    this.socket = undefined;
    this._connect();
  }

  private _connect() {
    const options = {
      autoConnect: true,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      transports: ["polling", "websocket"],
    };

    this.socket = io(API.apiUrl, options);

    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    this.socket.on("connect_error", (err: any) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  subscribe(event: string, callback: () => void) {
    this.socket!.on(event, callback);
  }

  send(event: string, data?: unknown) {
    this.socket!.emit(event, data);
  }
}
