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
  useEffect(() => {
    const handleUpdate = (message: WebSocketServerMessageJson) => {
      if (message.type === "update") {
        setInstruments(message.instruments);
      }
    };

    /**
     * ❌ subscribe not working
     */

    client.subscribe(instrumentSymbols, handleUpdate);

    return () => {
      client.unsubscribe(instrumentSymbols, handleUpdate);
    };
  }, [instrumentSymbols]);

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
    <div className="instrument-reel">
      {instruments.length > 0 ? (
        <div className="instrument-list">
          {instruments.map((instrument: Instrument) => (
            <div key={instrument.code} className="instrument-item">
              <img
                className="instrument-icon"
                src={`../../../public/${instrument.code}.svg`}
                alt={instrument.code}
              />
              {instrument.code} {instrument.lastQuote}
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
