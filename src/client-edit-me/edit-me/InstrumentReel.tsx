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
  const [readyState, setReadyState] = React.useState<WebSocketReadyState>(0);

  const handleMessage = (newInstruments: any[]) => {
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
    client.subscribeToSymbolUpdates(instrumentSymbols, handleMessage);
    return () => {
      client.unsubscribeFromSymbolUpdates(instrumentSymbols, handleMessage);
    };
  }, [instrumentSymbols, readyState]);
  return instruments;
}

function useWindowWidth() {
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
  return width;
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
  const windowWidth = useWindowWidth();
  let items: InstrumentReelItem[] = [];
  do {
    items = items.concat(instruments);
  } while (items.length * 220 < windowWidth * 2);

  return (
    <div className="instrument-reel">
      <div className="instrument-reel-track">
        {items.map(([symbol, lastQuote], i) => {
          const loading = lastQuote === "...";
          const formattedQuote = parseFloat(lastQuote as string).toFixed(3);
          return (
            <div key={i} className="instrument">
              <span className="instrument-name">{symbol}</span>
              <span className={`instrument-quote ${loading ? "" : "loaded"}`}>
                {loading ? "..." : formattedQuote}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InstrumentReel;
