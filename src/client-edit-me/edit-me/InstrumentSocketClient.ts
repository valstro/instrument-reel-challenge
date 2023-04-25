/**
 * ☑️ You can edit MOST of this file to add your own styles.
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
  private _messageQueue: WebSocketMessage[] = [];
  private _subscriptions = new Set<{
    instrumentSymbols: InstrumentSymbol[];
    callback: (instruments: Instrument[]) => void;
  }>();

  constructor() {
    /**
     * ❌ Please do not edit this private property assignment
     */
    this._socket = new WebSocket("ws://localhost:3000/ws");

    /**
     * ✅ You can edit from here down 👇
     */
    this._socket.addEventListener("open", this._onOpen.bind(this));
    this._socket.addEventListener("close", this._onClose.bind(this));
    this._socket.addEventListener("error", this._onError.bind(this));
    this._socket.addEventListener("message", this._onMessage.bind(this));
  }

  public subscribe(
    instrumentSymbols: InstrumentSymbol[],
    callback: (instruments: Instrument[]) => void
  ) {
    const subscription = {
      instrumentSymbols,
      callback,
    };

    this._subscriptions.add(subscription);
    this._sendSubscriptionMessage("subscribe", instrumentSymbols);

    return () => {
      this._subscriptions.delete(subscription);

      const remainingTracked = Array.from(this._subscriptions).flatMap(
        (s) => s.instrumentSymbols
      );

      const unsubscribeInstruments = instrumentSymbols.filter(
        (t) => !remainingTracked.includes(t)
      );

      if (unsubscribeInstruments.length) {
        this._sendSubscriptionMessage("unsubscribe", unsubscribeInstruments);
      }
    };
  }

  public dispose() {
    this._socket.close();
    this._socket.removeEventListener("open", this._onOpen.bind(this));
    this._socket.removeEventListener("close", this._onClose.bind(this));
    this._socket.removeEventListener("error", this._onError.bind(this));
    this._socket.removeEventListener("message", this._onMessage.bind(this));
  }

  private _onInstrumentUpdate(instruments: Instrument[]) {
    this._subscriptions.forEach((s) => {
      s.callback(
        instruments.filter((t) => s.instrumentSymbols.includes(t.code))
      );
    });
  }

  private _sendSubscriptionMessage(
    type: "subscribe" | "unsubscribe",
    instrumentSymbols: InstrumentSymbol[]
  ) {
    const json: WebSocketClientMessageJson = {
      type,
      instrumentSymbols,
    };
    this._sendMessage(JSON.stringify(json));
  }

  private _sendMessage(message: WebSocketMessage) {
    if (this._socket.readyState === WebSocketReadyState.OPEN) {
      console.log("sending", message);
      this._socket.send(message);
    } else {
      this._messageQueue.push(message);
    }
  }

  private _onOpen() {
    this._messageQueue.splice(0).forEach((message) => {
      this._sendMessage(message);
    });
  }

  private _onMessage(message: MessageEvent<any>) {
    try {
      const data = JSON.parse(message.data) as WebSocketServerMessageJson;
      switch (data.type) {
        case "update":
          this._onInstrumentUpdate(data.instruments);
      }
    } catch (e) {
      console.error("Could not parse message", e);
    }
  }

  private _onClose() {
    console.log("onClose");
  }

  private _onError(e: Event) {
    console.error("onError", e);
  }
}
