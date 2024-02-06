/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import React from "react";
import { InstrumentSymbol, WebSocketReadyState } from "../../common-leave-me";
import { InstrumentSocketClient } from "./InstrumentSocketClient";

import "./InstrumentReel.css";

/**
 * ❌ Please do not edit this
 */
const client = new InstrumentSocketClient();

/**
 * ❌ Please do not edit this hook name & args
 */

type InstrumentReelItem = [InstrumentSymbol, number | string];

function useInstruments(instrumentSymbols: InstrumentSymbol[]) {
  /**
   * ✅ You can edit inside the body of this hook
   */
  const pendingInstruments = instrumentSymbols.map(
    (symbol) => [symbol, "..."] as InstrumentReelItem
  );
  const [instruments, setInstruments] =
    React.useState<InstrumentReelItem[]>(pendingInstruments);
  const [readyState, setReadyState] = React.useState<WebSocketReadyState>(
    client.readyState
  );

  const handleMessage = (newInstruments: any[]) => {
    setInstruments(newInstruments);
  };

  React.useEffect(() => {
    const handleReadyStateChange = () => {
      setReadyState(client.readyState);
    };
    handleReadyStateChange();
    client.addEventListener("open", handleReadyStateChange);
    client.addEventListener("close", handleReadyStateChange);
    return () => {
      client.removeEventListener("open", handleReadyStateChange);
      client.removeEventListener("close", handleReadyStateChange);
    };
  }, []);

  React.useEffect(() => {
    if (readyState !== WebSocket.OPEN) {
      return;
    }
    client.subscribeToSymbolUpdates(instrumentSymbols, handleMessage);
    return () => {
      client.unsubscribeFromSymbolUpdates(instrumentSymbols, handleMessage);
    };
  }, [instrumentSymbols, readyState]);
  return instruments;
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function InstrumentReel({ instrumentSymbols }: InstrumentReelProps) {
  /**
   * ❌ Please do not edit this
   */
  const instruments = useInstruments(instrumentSymbols);

  /**
   * ✅ You can edit from here down in this component.
   * Please feel free to add more components to this file or other files if you want to.
   */

  return (
    <div className="foo">
      {instruments.map(([symbol, lastQuote], i) => {
        return (
          <div key={i}>
            {symbol}: {lastQuote}
          </div>
        );
      })}
    </div>
  );
}

export default InstrumentReel;
