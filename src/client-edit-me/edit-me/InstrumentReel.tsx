/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Instrument, InstrumentSymbol } from "../../common-leave-me";
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
  const [instruments, setInstruments] = useState<Instrument[]>([]);

  useEffect(() => {
    const unsubscribe = client.subscribe(instrumentSymbols, (instruments) => {
      setInstruments(instruments);
    });

    return () => {
      unsubscribe();
    };
  }, [...instrumentSymbols]);

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
  const animationRef = useRef<Animation>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && instrumentSymbols.length) {
      animationRef.current?.cancel();
      animationRef.current = containerRef.current.animate(
        [
          { transform: `translateX(0px)` },
          {
            transform: `translateX(-${containerRef.current.clientWidth / 2}px)`,
          },
        ],
        {
          duration: instrumentSymbols.length * 3_000,
          iterations: Infinity,
          easing: "linear",
        }
      );
    }
  }, [containerRef.current, ...instrumentSymbols]);

  const onMouseEnter = useCallback(() => {
    animationRef.current?.pause();
  }, []);

  const onMouseLeave = useCallback(() => {
    animationRef.current?.play();
  }, []);

  if (!instrumentSymbols.length) {
    return <div className="ir ir--empty">No Instruments</div>;
  }

  if (!instruments.length) {
    return <div className="ir ir--loading">Loading Instruments...</div>;
  }

  return (
    <div className="ir">
      <div
        className="ir__inner-wrapper ir__inner-wrapper--scroll"
        ref={containerRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {instruments.map((instrument) => (
          <InstrumentReelItem key={instrument.code} instrument={instrument} />
        ))}
        {instruments.map((instrument) => (
          <InstrumentReelItem
            key={instrument.code + "-repeat-1"}
            instrument={instrument}
          />
        ))}
      </div>
    </div>
  );
}

export interface InstrumentReelItemProps {
  instrument: Instrument;
}

function InstrumentReelItem({ instrument }: InstrumentReelItemProps) {
  const prevQuoteRef = useRef(instrument.lastQuote);
  const precision = instrument.category === "forex" ? 2 : 1;
  const lastQuote = instrument.lastQuote.toFixed(precision);

  useEffect(() => {
    prevQuoteRef.current = instrument.lastQuote;
  }, [instrument.lastQuote]);

  const noDirClassName =
    instrument.lastQuote > prevQuoteRef.current
      ? "ir-item__number--up"
      : instrument.lastQuote < prevQuoteRef.current
      ? "ir-item__number--down"
      : "";

  const diff = instrument.lastQuote - prevQuoteRef.current;
  const percChange = (diff / prevQuoteRef.current) * 100;
  const dirSymbol = percChange > 0 ? "+" : "-";

  return (
    <div className="ir-item">
      <InstrumentIcon instrument={instrument} />
      <div className="ir-item__name">{instrument.name}</div>
      <div className={`ir-item__number ${noDirClassName}`}>{lastQuote}</div>
      <div className={`ir-item__number ${noDirClassName}`}>
        <span>{dirSymbol}</span>
        {Math.abs(percChange).toFixed(3)}
        <span>%</span>
      </div>
    </div>
  );
}

export interface InstrumentReelItemProps {
  instrument: Instrument;
}

function InstrumentIcon({ instrument }: InstrumentReelItemProps) {
  if (instrument.category === "forex") {
    return (
      <div className="ir-icon-pair">
        <img src={`/${instrument.category}/${instrument.pair[0]}.svg`} />
        <img src={`/${instrument.category}/${instrument.pair[1]}.svg`} />
      </div>
    );
  }

  return (
    <img
      className="ir-icon"
      src={`/${instrument.category}/${instrument.code}.svg`}
    />
  );
}

export default InstrumentReel;
