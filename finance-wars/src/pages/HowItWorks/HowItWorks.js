import "./HowItWorks.css";

function HowItWorks() {
  return (
    <div className="how-page">
      <h1 className="how-title">How FinanceWar Works</h1>

      <section className="how-card">
        <h2>📈 What is FinanceWar?</h2>
        <p>
          FinanceWar is a stock market simulation game designed to help users
          learn trading concepts without risking real money. It mimics real
          Indian stock market behavior using live price simulations.
        </p>
      </section>

      <section className="how-card">
        <h2>🔍 How to Analyze Stocks</h2>
        <p>
          Each stock’s price changes dynamically. Use the live price chart to
          observe trends:
        </p>
        <ul>
          <li>📊 Rising chart → bullish trend</li>
          <li>📉 Falling chart → bearish trend</li>
          <li>🔄 Sideways → wait and observe</li>
        </ul>
      </section>

      <section className="how-card">
        <h2>🟢 Buying Stocks</h2>
        <p>
          Select a stock from the market list and click <strong>BUY</strong>.
          The purchase price is deducted from your virtual wallet and added
          to your portfolio.
        </p>
      </section>

      <section className="how-card">
        <h2>🔴 Selling Stocks</h2>
        <p>
          You can sell a stock anytime from your portfolio. Selling at a
          higher price than the buy price gives profit; otherwise, it results
          in a loss.
        </p>
      </section>

      <section className="how-card">
        <h2>💰 Profit & Loss Calculation</h2>
        <p>
          Profit or loss is calculated using:
        </p>
        <code>(Current Price − Buy Price) × Quantity</code>
        <p>
          Your overall P/L determines your rank and trading advice.
        </p>
      </section>

      <section className="how-card">
        <h2>🏆 Leaderboard</h2>
        <p>
          Your total portfolio value and profit are compared with other
          players globally. Higher profits improve your leaderboard rank.
        </p>
      </section>

      <section className="how-card">
        <h2>🧠 Smart Advice</h2>
        <p>
          The system analyzes your profit/loss and provides intelligent
          suggestions to help you improve your trading decisions.
        </p>
      </section>
    </div>
  );
}

export default HowItWorks;
