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
const DEBUGGING = true;
/**
 * ❌ Please do not edit this class name
 */
export class InstrumentSocketClient {
  /**
   * ❌ Please do not edit this private property name
   */
  private _socket: WebSocket;

  /**
   * ✅ You can add more properties for the class here (if you want) 👇
   */

  private _subscriptions: Map<any, any>;
  static sockets: WebSocket[] = [];

  constructor() {
    /**
     * ❌ Please do not edit this private property assignment
     */

    // note: even though this is instantiated once in module scope in the component tsx file,
    // hot reloads rerun that file, causing multiple sockets to be created and not removed
    this._socket = new WebSocket("ws://localhost:3000/ws");

    /**
     * ✅ You can edit from here down 👇
     */
    this.globalListeners.forEach(([eventType, callback]) => {
      this._socket.addEventListener(eventType, callback);
    });
    InstrumentSocketClient.sockets.push(this._socket);

    this._subscriptions = new Map();
  }

  // DEBUGGING
  private globalListeners: any[] = [
    // ["open", () => console.log("websocket open")],
    DEBUGGING && [
      "message",
      (event: MessageEvent) =>
        console.log(
          "Message from server ",
          JSON.parse(event.data).instruments.map((i: any) => i.code)
        ),
    ],
  ].filter((l) => l) as any[];

  close() {
    if (DEBUGGING) {
      this.globalListeners.forEach(([eventType, callback]) => {
        this._socket.removeEventListener(eventType, callback);
      });
      InstrumentSocketClient.sockets = InstrumentSocketClient.sockets.filter(
        (socket) => socket !== this._socket
      );
    }
    this._socket.close();
  }

  get readyState(): WebSocketReadyState {
    return this._socket.readyState;
  }

  private _sendMessage(message: WebSocketClientMessageJson) {
    this._socket.send(JSON.stringify(message));
  }

  private _parseInstrumentsMessage(data: any) {
    const message = JSON.parse(data);
    return Object.fromEntries(
      message.instruments.map((i: any) => [i.code, i.lastQuote])
    );
  }

  addEventListener(eventType: string, callback: (event: Event) => void) {
    this._socket.addEventListener(eventType, callback);
  }

  removeEventListener(eventType: string, callback: (event: Event) => void) {
    this._socket.removeEventListener(eventType, callback);
  }

  // TODO: DISCUSS:
  // subscribeToSymbolUpdates couples the server-side subscription to the message listener.
  // They seem like the same concern to me, but it feels cleaner maybe to separate them?
  // e.g.
  //
  // requestInstrumentUpdates(instrumentSymbols: InstrumentSymbol[]) {
  //   this._sendMessage({
  //     type: "subscribe",
  //     instrumentSymbols,
  //   });
  // });
  //
  // onInstrumentUpdate(callback: (newInstruments: any[]) => void) {
  //   const handler = (event: any) => {
  //     const updates = this._parseInstrumentsMessage(event.data);
  //     const newInstruments: any = instrumentSymbols.map((symbol) => [
  //       symbol,
  //       updates[symbol],
  //     ]);
  //     callback(newInstruments);
  //   };
  //   this._socket.addEventListener("message", handler);
  //   return () => this._socket.removeEventListener("message", handler);
  // }
  subscribeToSymbolUpdates(
    instrumentSymbols: InstrumentSymbol[],
    callback: (newInstruments: any[]) => void
  ) {
    this._sendMessage({
      type: "subscribe",
      instrumentSymbols,
    });
    const handler = (event: any) => {
      const updates = this._parseInstrumentsMessage(event.data);
      const newInstruments: any = instrumentSymbols.map((symbol) => [
        symbol,
        updates[symbol],
      ]);
      callback(newInstruments);
    };
    this._subscriptions.set(callback, handler);
    this._socket.addEventListener("message", handler);
  }

  unsubscribeFromSymbolUpdates(
    instrumentSymbols: InstrumentSymbol[],
    callback: (newInstruments: any[]) => void
  ) {
    this._sendMessage({
      type: "unsubscribe",
      instrumentSymbols,
    });
    const handler = this._subscriptions.get(callback);
    this._socket.removeEventListener("message", handler);
  }
}
