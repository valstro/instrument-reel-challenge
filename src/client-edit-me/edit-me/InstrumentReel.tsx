/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import React from "react";
import {
  InstrumentSymbol,
  Instrument,
  WebSocketReadyState,
} from "../../common-leave-me";
import { InstrumentSocketClient } from "./InstrumentSocketClient";

import "./InstrumentReel.css";

/**
 * ❌ Please do not edit this
 */
const client = new InstrumentSocketClient();
/**
 * ❌ Please do not edit this hook name & args
 */

function useInstruments(instrumentSymbols: InstrumentSymbol[]) {
  /**
   * ✅ You can edit inside the body of this hook
   */
  const pendingInstruments = instrumentSymbols.map((code) => {
    return { code };
  });
  const [instruments, setInstruments] = React.useState<Instrument[]>(
    pendingInstruments as Instrument[]
  );
  const [readyState, setReadyState] = React.useState<WebSocketReadyState>(0);

  const handleMessage = (newInstruments: Instrument[]) => {
    setInstruments(newInstruments);
  };

  React.useEffect(() => {
    const handleReadyStateChange = () => {
      setReadyState(client.readyState());
    };
    setReadyState(client.readyState());
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
    const unsubscribe = client.subscribeToSymbolUpdates(
      instrumentSymbols,
      handleMessage
    );
    return () => {
      unsubscribe();
    };
  }, [instrumentSymbols, readyState]);
  return instruments;
}

function usePaddedItems(instruments: Instrument[]) {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  let items: Instrument[] = [];
  do {
    items = items.concat(instruments);
  } while (items.length * 220 < width * 2);
  return items;
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function InstrumentReelItem({ item }: { item: Instrument }) {
  const { code, lastQuote } = item;
  console.log("lastQuote", lastQuote);
  const loading = !lastQuote;
  const price = loading ? "..." : lastQuote?.toFixed(3);
  return (
    <div className="instrument">
      <span className="instrument-name">{code}</span>
      <span className={`instrument-quote ${loading ? "" : "loaded"}`}>
        {price}
      </span>
    </div>
  );
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
  const items = usePaddedItems(instruments);

  return (
    <div className="instrument-reel">
      <div className="instrument-reel-track">
        {items.map((item, i) => (
          <InstrumentReelItem key={i} item={item} />
        ))}
        <div className="instrument-reel-backfill">
          {items.map((item, i) => (
            <InstrumentReelItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstrumentReel;
