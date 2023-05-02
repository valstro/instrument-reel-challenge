/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import {
  Instrument,
  InstrumentSymbol,
  WebSocketClientMessageJson,
  WebSocketMessage,
  WebSocketReadyState,
  WebSocketServerMessageJson,
} from "../../common-leave-me";

/**
 * Notes:
 * 
 * To subscribe or unsubscribe to/from instrument(s), send a message to the server with the following format:
 * 
 * export type WebSocketClientMessageJson =
  | {
      type: "subscribe";
      instrumentSymbols: InstrumentSymbol[];
    }
  | {
      type: "unsubscribe";
      instrumentSymbols: InstrumentSymbol[];
    };
  *
  * The server will start responding with a message with the following format:
  * 
  * export type WebSocketServerMessageJson = {
      type: "update";
      instruments: Instrument[];
    };
 */

/**
 * ❌ Please do not edit this class name
 */
export class InstrumentSocketClient {
  /**
   * ❌ Please do not edit this private property name
   */
  private _socket: WebSocket;
  private _callbacks: {
    [key: string]: (message: WebSocketServerMessageJson) => void;
  } = {};

  instrumentSymbols: InstrumentSymbol[] = [];

  subscribeMessage: WebSocketClientMessageJson = {
    type: "subscribe",
    instrumentSymbols: this.instrumentSymbols,
  };
  constructor() {
    this._socket = new WebSocket("ws://localhost:3000/ws");

    this._socket.onopen = () => {
      this._socket.send(JSON.stringify(this.subscribeMessage));

      console.log("subscribeMessage MESSAGE", this.subscribeMessage);
    };

    this._socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      // if (message.type === "update") {
      const callbacks = Object.values(this._callbacks);
      console.log("INSTRUMENT callbacks", callbacks);
      console.log("INSTRUMENT MESSAGE", message);

      callbacks.forEach((callback) => callback(message));
      // }
    };
  }

  public subscribe(
    instrumentSymbols: InstrumentSymbol[],
    callback: (message: WebSocketServerMessageJson) => void
  ) {
    const id: string = Math.random().toString(36).substr(2, 9);
    this._callbacks[id] = callback;

    const subscribeMessage: WebSocketClientMessageJson = {
      type: "subscribe",
      instrumentSymbols: instrumentSymbols,
    };
    console.log("INSTRUMENT MESSAGE", subscribeMessage);

    if (this._socket.readyState === WebSocketReadyState.OPEN) {
      this._socket.send(JSON.stringify(subscribeMessage));
    }
    return id;
  }

  public unsubscribe(
    instrumentSymbols: InstrumentSymbol[],
    callback: (message: WebSocketServerMessageJson) => void
  ): void {
    const id = Object.keys(this._callbacks).find(
      (key) => this._callbacks[key] === callback
    );

    if (id) {
      delete this._callbacks[id];

      const unsubscribeMessage: WebSocketClientMessageJson = {
        type: "unsubscribe",
        instrumentSymbols: instrumentSymbols,
      };

      this._socket.send(JSON.stringify(unsubscribeMessage));
    }
  }
}
