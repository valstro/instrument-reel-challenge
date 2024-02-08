/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import React, { useEffect } from "react";
import { InstrumentSymbol, Instrument } from "../../common-leave-me";
import { InstrumentSocketClient } from "./InstrumentSocketClient";

import "./InstrumentReel.css";

/**
 * ❌ Please do not edit this
 */
const client = new InstrumentSocketClient();
/**
 * ❌ Please do not edit this hook name & args
 */

interface DisplayableInstrument extends Instrument {
  change?: number;
  icon?: string;
}

function useInstruments(instrumentSymbols: InstrumentSymbol[]) {
  /**
   * ✅ You can edit inside the body of this hook
   */
  const pendingInstruments = instrumentSymbols.map((code) => {
    return { code };
  });
  const [instruments, setInstruments] = React.useState<DisplayableInstrument[]>(
    pendingInstruments as DisplayableInstrument[]
  );
  const handleMessage = (newInstruments: Instrument[]) => {
    setInstruments((prevInstruments) => {
      return newInstruments.map((newInstrument) => {
        const displayableInstrument: DisplayableInstrument = {
          ...newInstrument,
          change: undefined,
        };
        const prevInstrument = prevInstruments.find(
          (i) => i.code === newInstrument.code
        );
        if (prevInstrument) {
          displayableInstrument.change =
            ((newInstrument.lastQuote - prevInstrument.lastQuote) /
              prevInstrument.lastQuote) *
            100;
        }
        return displayableInstrument;
      });
    });
  };
  useEffect(() => {
    const unsubscribe = client.subscribeToInstruments(
      instrumentSymbols,
      handleMessage
    );
    return () => {
      unsubscribe();
    };
  }, [instrumentSymbols]);
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
  } while (items.length * 500 < width * 2);
  return items;
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function InstrumentReelItem({ item }: { item: DisplayableInstrument }) {
  const { code, category, name, change, lastQuote } = item;
  const loading = !lastQuote;
  const price = lastQuote?.toFixed(3) || "...";
  const changePercentage = change?.toFixed(2) || "...";
  return (
    <div className={`instrument ${loading ? "" : "loaded"}`}>
      <span className="instrument-icon">
        <img src={`/${category}/${code}.svg`} />
      </span>
      <span className="instrument-name">{name}</span>
      <span className={"instrument-quote"}>{price}</span>
      <span
        className={`instrument-change ${
          change && change < 0 ? "negative" : "positive"
        }`}
      >
        {changePercentage}
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
            <InstrumentReelItem key={`backfill-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstrumentReel;
