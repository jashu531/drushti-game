import "./MarketTicker.css";

function MarketTicker({ stocks }) {
  return (
    <div className="ticker-wrapper">
      <div className="ticker">
        {stocks.concat(stocks).map((stock, index) => {
          const isUp = stock.price > stock.prevPrice;
          const isDown = stock.price < stock.prevPrice;

          return (
            <div className="ticker-item" key={index}>
              <span className="ticker-name">{stock.name}</span>

              <span
                className={`ticker-price ${
                  isUp ? "up" : isDown ? "down" : ""
                }`}
              >
                ₹{stock.price}
              </span>

              {isUp && <span className="arrow up">▲</span>}
              {isDown && <span className="arrow down">▼</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MarketTicker;
