import "./Home.css";
import MarketTicker from "../../components/MarketTicker";
import initialStocks from "../../data/stocks";
import { useEffect, useState } from "react";
import { updateStockPrices } from "../../logic/priceEngine";


function Home({ startGame, openHowItWorks }) {
 const [stocks, setStocks] = useState(
  initialStocks.map((s) => ({ ...s, prevPrice: s.price }))
);

useEffect(() => {
  const interval = setInterval(() => {
    setStocks((prev) =>
      updateStockPrices(prev).map((stock, i) => ({
        ...stock,
        prevPrice: prev[i].price,
      }))
    );
  }, 2000);

  return () => clearInterval(interval);
}, []);


  return (
    <div className="hero">
      <h1 className="hero-title">FINANCEWAR</h1>
      <div className="hero-divider" />
      <h2 className="hero-subtitle">Master the Market.</h2>

      <p className="hero-text">
        Step into the ultimate finance strategy battlefield. Trade in Indian
        markets, compete, and dominate the leaderboard in this premium market
        simulation game.
      </p>

      <div className="hero-buttons">
        <button className="btn primary" onClick={startGame}>
          Get Started →
        </button>
        <button className="how-btn secondary" onClick={openHowItWorks}>
  📘 How It Works
</button>



      </div>

      <MarketTicker stocks={stocks} />
      

    </div>
  );


}

export default Home;
