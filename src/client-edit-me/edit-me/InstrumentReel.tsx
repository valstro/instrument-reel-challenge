/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import {
  Instrument,
  InstrumentSymbol,
  WebSocketServerMessageJson,
} from "../../common-leave-me";
import { InstrumentSocketClient } from "./InstrumentSocketClient";
import "./InstrumentReel.css";
import { useState, useEffect } from "react";

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
  const [previousQuotes, setPreviousQuotes] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    // Subscribe to websocket for instrument update
    const handleUpdate = (message: WebSocketServerMessageJson) => {
      if (message.type === "update") {
        const updatedInstruments = message.instruments.map((instrument) => {
          const previousQuote = previousQuotes[instrument.code];
          return {
            ...instrument,
            previousQuote,
          };
        });

        // Update instrument state and previous quote state
        setInstruments(updatedInstruments);
        message.instruments.forEach((instrument) => {
          setPreviousQuotes((prev) => ({
            ...prev,
            [instrument.code]: instrument.lastQuote,
          }));
        });
      }
    };

    client.subscribe(instrumentSymbols, handleUpdate);

    // Unsubscribe from websocket when component is unmounted
    return () => {
      client.unsubscribe(instrumentSymbols, handleUpdate);
    };
  }, [instrumentSymbols, previousQuotes]);

  return instruments;
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function getInstrumentIcon(code: InstrumentSymbol): JSX.Element {
  // Return a custom icon for EUR/USD currency pair
  if (code === "EURUSD") {
    return (
      <>
        <div className="instrument-icon">
          <img className="USD" src={"EUR.svg"} alt="EUR" />
          <img className="EUR" src={"USD.svg"} alt="USD" />
        </div>
      </>
    );
  } else {
    // Return an icon with the currency code as its image source for all other instruments
    return <img className="instrument-icon" src={`${code}.svg`} alt={code} />;
  }
}

function getPercentageChange(current: number, previous: number): string {
  const change = ((current - previous) / previous) * 100;
  const sign = previous < current ? "+" : "";
  return sign + change.toString();
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
    <div className="instrument-reel ">
      {instruments.length > 0 ? (
        <div className="instrument-list">
          {instruments.map((instrument: Instrument) => (
            <div key={instrument.code} className="instrument-item">
              <div className="instrument-info">
                <div className="instrument-icon">
                  {getInstrumentIcon(instrument.code)}
                </div>
                <div className="instrument-name">{instrument.name}</div>
                <div
                  className={`instrument-quotes ${
                    //@ts-ignore
                    instrument.previousQuote < instrument.lastQuote
                      ? "positive"
                      : //@ts-ignore
                      instrument.previousQuote > instrument.lastQuote
                      ? "negative"
                      : ""
                  }`}
                >
                  {instrument.lastQuote.toFixed(1)}
                </div>

                <div
                  className={`instrument-quotes ${
                    Number(
                      getPercentageChange(
                        instrument.lastQuote,
                        //@ts-ignore
                        instrument.previousQuote
                      )
                    ) < 0
                      ? "negative"
                      : "positive"
                  }`}
                >
                  {getPercentageChange(
                    instrument.lastQuote,
                    //@ts-ignore
                    instrument.previousQuote
                  )[0] === "-"
                    ? "-"
                    : "+"}
                  {Math.abs(
                    Number(
                      getPercentageChange(
                        instrument.lastQuote,
                        //@ts-ignore
                        instrument.previousQuote
                      )
                    )
                  ).toFixed(3)}
                  %
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="loading-message">Loading instruments...</div>
      )}
    </div>
  );
}

export default InstrumentReel;
