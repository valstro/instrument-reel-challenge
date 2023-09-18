/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */

import { useEffect, useCallback, useMemo, useState } from "react";

import { InstrumentSymbol } from "../../common-leave-me";
import type { Instrument  } from '../../common-leave-me';
import { InstrumentSocketClient } from "./InstrumentSocketClient";

import ReelItem from "./components/ReelItem/ReelItem";

import "./InstrumentReel.css";

const getChange = (current: number, prev?: number) => {
  if (!prev) return 0;
  const difference = current - prev;
  const change = difference / current * 100;

  return change;
}

// slightly hacky way to create a loopable list of symbols that looks smooth as it scrolls
const getLoopableSymbols = (symbols: InstrumentSymbol[]) => {
  let loopableSymbols: InstrumentSymbol[] = [...symbols, ...symbols];
  // minimum 7 as the reel will show 3 at a time, 7 allows us to wrap around until animaiton resets
  while (loopableSymbols.length < 7) {
    loopableSymbols = loopableSymbols.concat(symbols);
  }
  return loopableSymbols
}

// TODO: rename this to be more descriptive
type InstrumentType = {
  [key in InstrumentSymbol]?: Instrument;
}

type InstrumentsState = {
  current: InstrumentType;
  previous: InstrumentType;
};

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

  const [instrumentData, setInstrumentData] = useState<InstrumentsState>({
    current: instrumentSymbols.reduce((prev, symb) => ({ ...prev, [symb]: {}}), {}),
    previous: {},
  });

  const onMessage = useCallback((instruments: Instrument[]) => {
    const newInstruments = instruments.reduce((prev, instrument) => {
      return {...prev, [instrument.code]: instrument}
    }, {});

    setInstrumentData(old => ({
      current: newInstruments,
      previous: old.current,
    }))
  }, []);

  useEffect(() => {
    client.subscribe(instrumentSymbols, onMessage);
  }, []);

  return instrumentData;
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
  const loopingInstruments = useMemo(() => getLoopableSymbols(instrumentSymbols), [instrumentSymbols]);

  return (
    <div className="reelContainer">
      <div className="instrumentReel">
        {loopingInstruments.map((symbol: InstrumentSymbol, i) => {
          const {
            name,
            lastQuote,
          } = instruments.current[symbol] as Instrument; 
          const change = getChange(lastQuote,instruments?.previous[symbol]?.lastQuote);
          return <ReelItem key={i} symbol={symbol} name={name} price={lastQuote} change={change} />;
        })}
      </div>
    </div>
  );
}

export default InstrumentReel;
