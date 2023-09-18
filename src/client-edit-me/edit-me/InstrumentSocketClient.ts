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

  /**
   * ✅ You can add more properties for the class here (if you want) 👇
   */

  #messageCallback: (instruments: any[]) => void;

  // private subscriptions: string;

  constructor() {
    /**
     * ❌ Please do not edit this private property assignment
     */
    this._socket = new WebSocket("ws://localhost:3000/ws");
    
    /**
     * ✅ You can edit from here down 👇
    */
   
    this.#messageCallback = () => null;
    this.onMessage = this.onMessage.bind(this);
    this._socket.addEventListener('message', this.onMessage);
   
  }

  onMessage(e: MessageEvent) {
    const data = JSON.parse(e.data);
    if (data.type === 'update') {
      this.#messageCallback(data.instruments);
    };
  }

  async subscribe(instrumentSymbols: InstrumentSymbol[], onMessageCallback: (instruments: Instrument[]) => void): Promise<boolean> {
    if (this._socket.readyState === WebSocketReadyState.OPEN) {
      this._socket.send(JSON.stringify({
        type: 'subscribe', instrumentSymbols
      }));

      this.#messageCallback = onMessageCallback;
      return true;
    } 
    else {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const unsubscribe = await this.subscribe(instrumentSymbols, onMessageCallback)
          resolve(unsubscribe);
        }, 500);
      });
    }
  }
}
