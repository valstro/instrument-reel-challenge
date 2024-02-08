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

  /**
   * ✅ You can add more properties for the class here (if you want) 👇
   */

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
  }

  private _sendMessage(message: WebSocketClientMessageJson) {
    this._socket.send(JSON.stringify(message));
  }

  private _listenOnce(eventType: string, callback: (event: Event) => void) {
    const callAndRemoveListener = (event: Event) => {
      callback(event);
      this._socket.removeEventListener(eventType, callAndRemoveListener);
    };
    this._socket.addEventListener(eventType, callAndRemoveListener);
  }

  private _sendMessageWhenReady(message: WebSocketClientMessageJson) {
    if (this._socket.readyState === WebSocketReadyState.OPEN) {
      this._sendMessage(message);
    } else {
      this._listenOnce("open", () => {
        this._sendMessage(message);
      });
    }
  }

  private _parseInstrumentsMessage(data: string) {
    const message: WebSocketServerMessageJson = JSON.parse(data);
    return Object.fromEntries(message.instruments.map((i: any) => [i.code, i]));
  }

  subscribeToInstruments(
    instrumentSymbols: InstrumentSymbol[],
    callback: (instruments: Instrument[]) => void
  ) {
    this._sendMessageWhenReady({
      type: "subscribe",
      instrumentSymbols,
    });
    const handler = (event: any) => {
      const updates = this._parseInstrumentsMessage(event.data);
      const instruments: any = instrumentSymbols.map((code) => updates[code]);
      callback(instruments);
    };
    this._socket.addEventListener("message", handler);
    return () => this._socket.removeEventListener("message", handler);
  }
}
