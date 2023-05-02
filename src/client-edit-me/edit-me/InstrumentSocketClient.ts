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
    [key: string]: {
      callback: (message: WebSocketServerMessageJson) => void;
      prevQuote: Instrument | null;
    };
  } = {};

  instrumentSymbols: InstrumentSymbol[] = [];

  subscribeMessage: WebSocketClientMessageJson = {
    type: "subscribe",
    instrumentSymbols: this.instrumentSymbols,
  };
  constructor() {
    /**
     * This creates a new WebSocket object that connects to the server at "ws://localhost:3000/ws".
     *
     * The WebSocket object is saved as a private property of the client object for use in other methods.
     */
    this._socket = new WebSocket("ws://localhost:3000/ws");

    /**
     * This sends the initial subscribe message to the server when the WebSocket connection is opened.
     *
     * The initial subscribe message contains an empty array of instrument symbols.
     * The actual instrument symbols that the client is subscribed to are added later with the subscribe method.
     */
    this._socket.onopen = () => {
      this._socket.send(JSON.stringify(this.subscribeMessage));
    };

    /**
     * This processes incoming messages from the server.
     * If the message is an "update" message, it calls all of the registered callback functions with the updated instrument data.
     * If the message is not an "update" message, it is ignored.
     */
    this._socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === "update") {
        const callbacks = Object.values(this._callbacks);
        callbacks.forEach(({ callback, prevQuote }) => {
          message.instruments.forEach((newQuote: any) => {
            if (newQuote.code === prevQuote?.code) {
              newQuote = { ...prevQuote, ...newQuote };
            }
          });
          callback(message);
        });
      }
    };
  }

  /**
   * The subscribe method takes an array of instrumentSymbols to subscribe to and a callback function that is called every time an update is received from the server.
   * It generates a unique identifier for the callback and stores it along with the prevQuote property in the _callbacks object.
   * It also sends a subscribeMessage to the server to start receiving updates.
   *
   * @param {InstrumentSymbol[]} instrumentSymbols - An array of instrument symbols to subscribe to.
   * @param {Function} callback - A function to be called every time an update is received from the server.
   * @returns {string} - A unique identifier for the callback function.
   */
  public subscribe(
    instrumentSymbols: InstrumentSymbol[],
    callback: (message: WebSocketServerMessageJson) => void
  ): string {
    const id: string = Math.random().toString();
    this._callbacks[id] = {
      callback,
      prevQuote: null,
    };

    const subscribeMessage: WebSocketClientMessageJson = {
      type: "subscribe",
      instrumentSymbols: instrumentSymbols,
    };

    if (this._socket.readyState === WebSocketReadyState.OPEN) {
      this._socket.send(JSON.stringify(subscribeMessage));
    }

    return id;
  }

  /**
   * The unsubscribe method takes an array of instrumentSymbols and a callback function that was previously registered with the subscribe method.
   * It finds the unique identifier associated with the callback function in the _callbacks object, deletes it,
   * and sends an unsubscribeMessage to the server to stop receiving updates.
   */
  public unsubscribe(
    instrumentSymbols: InstrumentSymbol[],
    callback: (message: WebSocketServerMessageJson) => void
  ): void {
    const id = Object.keys(this._callbacks).find(
      (key) => this._callbacks[key].callback === callback
    );
    if (id) {
      delete this._callbacks[id];

      const unsubscribeMessage: WebSocketClientMessageJson = {
        type: "unsubscribe",
        instrumentSymbols: instrumentSymbols,
      };

      if (this._socket.readyState === WebSocketReadyState.OPEN) {
        this._socket.send(JSON.stringify(unsubscribeMessage));
      }
    }
  }
}
