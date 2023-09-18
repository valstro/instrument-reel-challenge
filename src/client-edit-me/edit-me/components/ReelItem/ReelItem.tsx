import { InstrumentSymbol } from "../../../../common-leave-me";
import AAPLicon from '../../../../../public/stocks/AAPL.svg';
import TSLAicon from '../../../../../public/stocks/TSLA.svg';
import SP500icon from '../../../../../public/indicies/SP500.svg';
import US100icon from '../../../../../public/indicies/US100.svg';
import USDicon from '../../../../../public/forex/USD.svg';
import EURicon from '../../../../../public/forex/EUR.svg';
import ETHicon from '../../../../../public/crypto/ETH.svg';
import BTCicon from '../../../../../public/crypto/BTC.svg';

const icons = {
    AAPL: AAPLicon,
    TSLA: TSLAicon,
    SP500: SP500icon,
    US100: US100icon,
    USD: USDicon,
    EURUSD: EURicon,
    ETH: ETHicon,
    BTC: BTCicon,
}

const getIcon = (symbol: InstrumentSymbol) => {
    // TODO: this should be a helper/hook so that icons can be dynamically loaded
    return icons[symbol];
}

import './ReelItem.css';

type ReelItem = {
    symbol: InstrumentSymbol,
    name?: string,
    price?: number,
    change?: number,
}

const ReelItem = ({
    symbol,
    name,
    price,
    change,
}: ReelItem) => {
    if (!price || !name || !change) return <div className="reelItem"><p className="reelItemLabel">Loading {symbol}...</p></div>;
    return (
        <div className="reelItem">
            <div className="reelItemContent">
                <img className="reelitemLogo" src={getIcon(symbol)} />
                <p className="reelItemLabel">{name}</p>
                <p className="reelItemLabel">{price}</p>
                <p className={change < 0 ? "reelItemChangeRed" : "reelItemChangeGreen"}>{change.toFixed(3)}%</p>
            </div>
        </div>
    )
}

export default ReelItem;
