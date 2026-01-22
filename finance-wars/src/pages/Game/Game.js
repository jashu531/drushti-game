import { useEffect, useState } from "react";
import "./Game.css";
import initialStocks from "../../data/stocks";
import { updateStockPrices } from "../../logic/priceEngine";
import { auth } from "../../firebase/firebase";
import { saveUserData, loadUserData } from "../../firebase/realtimeDb";
import { updateLeaderboard } from "../../firebase/leaderboardDb";
import CandlestickChart from "../../components/CandlestickChart";
import StockAnalysisModal from "../../components/StockAnalysisModal";


function Game() {
  const [advice, setAdvice] = useState("");
  const [stocks, setStocks] = useState(initialStocks);
  const [selectedStock, setSelectedStock] = useState(null);
  const [wallet, setWallet] = useState(100000);
  const [portfolio, setPortfolio] = useState([]);
  const [message, setMessage] = useState("");
  const [priceHistory, setPriceHistory] = useState({});
  const [tradeExplanation, setTradeExplanation] = useState("");
  const [learningMode, setLearningMode] = useState("beginner");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [league, setLeague] = useState("Rookie Trader");
  const [mentorInput, setMentorInput] = useState("");
  const [mentorMessages, setMentorMessages] = useState([
  { from: "mentor", text: "Hi 👋 I’m your trading mentor. Ask me anything." }
]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [showAnalysis, setShowAnalysis] = useState(false);


  /* =======================
     📊 PORTFOLIO CALCULATIONS
     ======================= */
  const portfolioValue = portfolio.reduce((total, item) => {
    const liveStock = stocks.find((s) => s.id === item.id);
    const currentPrice = liveStock
      ? liveStock.price
      : item.buyPrice;
    return total + currentPrice * item.quantity;
  }, 0);

  const totalValue = wallet + portfolioValue;
  const overallProfitLoss = totalValue - 100000;

  const filteredStocks = stocks.filter((stock) => {
  const matchesSearch = stock.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesSector =
    selectedSector === "All" ||
    stock.sector === selectedSector;

  return matchesSearch && matchesSector;
});


  const chartData =
  selectedStock &&
  priceHistory[selectedStock.id] &&
  priceHistory[selectedStock.id].length > 0
    ? {
        labels: priceHistory[selectedStock.id].map((_, i) => i + 1),
        datasets: [
          {
            label: "Price Movement",
            data: priceHistory[selectedStock.id].map(
              (candle) => candle.close
            ),
            backgroundColor: priceHistory[selectedStock.id].map(
              (candle) =>
                candle.close >= candle.open
                  ? "rgba(34,197,94,0.8)" // green
                  : "rgba(239,68,68,0.8)" // red
            ),
            
            borderRadius: 2,
          },
        ],

        
      }
    : null;



  /* =======================
     🧠 SMART ADVICE
     ======================= */
useEffect(() => {
  if (overallProfitLoss < 0) {
    setAdvice(
      learningMode === "beginner"
        ? "⚠ You are in loss. As a beginner, avoid panic trading and wait for confirmation."
        : learningMode === "intermediate"
        ? "Loss detected. Review volatility and news before next trade."
        : "Loss detected. Consider stop-loss and risk management."
    );
  } else if (overallProfitLoss > 0) {
    setAdvice(
      "✅ You are in profit. Follow your strategy and avoid overtrading."
    );
  } else {
    setAdvice("");
  }
}, [overallProfitLoss, learningMode]);

//LEAGUE
useEffect(() => {
  if (overallProfitLoss >= 20000) {
    setLeague("Elite Trader 💎");
  } else if (overallProfitLoss >= 10000) {
    setLeague("Strategic Trader 🥇");
  } else if (overallProfitLoss >= 3000) {
    setLeague("Market Explorer 🥈");
  } else {
    setLeague("Rookie Trader 🥉");
  }
}, [overallProfitLoss]);


 
  /* =======================
     🔄 LIVE PRICE UPDATES
     ======================= */
useEffect(() => {
  const interval = setInterval(() => {
    setStocks(prevStocks => {
      const updatedStocks = updateStockPrices(prevStocks);

      // 🔥 UPDATE CANDLE FROM UPDATED PRICE (NOT OLD PRICE)
      if (selectedStock) {
        const updated = updatedStocks.find(
          s => s.id === selectedStock.id
        );

        if (updated && Number.isFinite(updated.price)) {
          setPriceHistory(prev => {
            const history = prev[selectedStock.id] || [];
            const lastCandle = history[history.length - 1];

            const open = lastCandle
              ? lastCandle.close
              : updated.price;

            const close = updated.price;
            const high = Math.max(open, close);
            const low = Math.min(open, close);

            const time = lastCandle
              ? lastCandle.time + 2
              : Math.floor(Date.now() / 1000);

            const candle = { time, open, high, low, close };

<button onClick={() => setShowAnalysis(true)}>
  Analysis
</button>

            return {
              ...prev,
              [selectedStock.id]: [...history.slice(-200), candle],
            };
          });
        }
      }

      return updatedStocks;
    });
  }, 2000);

  return () => clearInterval(interval);
}, [selectedStock]);




  /* =======================
     🔥 LOAD USER DATA
     ======================= */
  useEffect(() => {
  const loadData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await loadUserData(user.uid);

    if (data) {
      setWallet(data.wallet);
      setPortfolio(data.portfolio || []);

      // ✅ ADD THIS LINE
      if (data.league) {
        setLeague(data.league);
      }
    } else {
      await saveUserData(user.uid, {
        wallet: 100000,
        portfolio: [],
        league: "Rookie Trader 🥉", // ✅ default league
      });
    }
  };

  loadData();
}, []);


  /* =======================
     🟢 BUY STOCK
     ======================= */
  const buyStock = () => {
    if (!selectedStock || wallet < selectedStock.price) return;

    setWallet(wallet - selectedStock.price);

    const existing = portfolio.find(
      (p) => p.id === selectedStock.id
    );

    const updatedPortfolio = existing
      ? portfolio.map((p) =>
          p.id === selectedStock.id
            ? {
                ...p,
                quantity: p.quantity + 1,
                buyPrice: Math.round(
                  (p.buyPrice * p.quantity +
                    selectedStock.price) /
                    (p.quantity + 1)
                ),
              }
            : p
        )
      : [
          ...portfolio,
          {
            ...selectedStock,
            quantity: 1,
            buyPrice: selectedStock.price,
          },
        ];

    setPortfolio(updatedPortfolio);
    setMessage(`Bought ${selectedStock.name}`);

    saveUserData(auth.currentUser.uid, {
      wallet: wallet - selectedStock.price,
      portfolio: updatedPortfolio,
      

      
    });

    updateLeaderboard(
      auth.currentUser.uid,
      auth.currentUser.email,
      totalValue,
      overallProfitLoss
    );
  };

  /* =======================
     🔴 SELL STOCK
     ======================= */
  const sellStock = () => {
    const owned = portfolio.find(
      (p) => p.id === selectedStock?.id
    );
    if (!owned) return;

    setWallet(wallet + selectedStock.price);

    const updatedPortfolio =
      owned.quantity === 1
        ? portfolio.filter(
            (p) => p.id !== selectedStock.id
          )
        : portfolio.map((p) =>
            p.id === selectedStock.id
              ? { ...p, quantity: p.quantity - 1 }
              : p
          );

          const profitLoss =
  (selectedStock.price - owned.buyPrice) * owned.quantity;


    setPortfolio(updatedPortfolio);

    saveUserData(auth.currentUser.uid, {
      wallet: wallet + selectedStock.price,
      portfolio: updatedPortfolio,
      league: league,
    });

    updateLeaderboard(
      auth.currentUser.uid,
      auth.currentUser.email,
      totalValue,
      overallProfitLoss
    );

    if (profitLoss > 0) {
  setTradeExplanation(
    "You made a profit because the stock price increased after you bought it. This indicates a positive market movement."
  );
} else if (profitLoss < 0) {
  setTradeExplanation(
    "You made a loss because the stock price dropped after purchase. This may be due to volatility or poor timing."
  );
} else {
  setTradeExplanation(
    "There was no profit or loss because the selling price was equal to the buying price."
  );
}

   setShowQuiz(true);
  };

  const getMentorReply = (userText) => {
  const text = userText.toLowerCase();

  if (!selectedStock) {
    return "Select a stock first so I can guide you better 📊";
  }

  if (text.includes("buy")) {
    if (overallProfitLoss < 0) {
      return learningMode === "beginner"
        ? "You are already in loss. Avoid buying emotionally. Wait for confirmation."
        : "Consider risk-reward before adding to a losing position.";
    }
    return "Price looks stable. Consider buying only if volume supports it.";
  }

  if (text.includes("sell")) {
    if (overallProfitLoss > 0) {
      return "You are in profit. Booking partial profit is a smart move 👍";
    }
    return "Selling now may lock losses. Check trend strength.";
  }

  if (text.includes("loss")) {
    return "Losses are part of trading. Focus on discipline, not recovery trades.";
  }

  if (text.includes("profit")) {
    return "Protect profits using stop-loss or partial booking.";
  }

  return "Good question 🤔 Focus on trend, risk management, and patience.";
};


  const sendMentorMessage = async () => {
  if (!mentorInput.trim()) return;

  // Add user message immediately
  setMentorMessages(prev => [
    ...prev,
    { from: "user", text: mentorInput }
  ]);

  const userInput = mentorInput;
  setMentorInput(""); // Clear input

  try {
    const res = await fetch("http://localhost:5000/mentor-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userInput,
        context: {
          learningMode,
          pnl: overallProfitLoss,
          stock: selectedStock?.name
        }
      })
    });

    if (!res.ok) throw new Error("Network error");
    
    const data = await res.json();
    
    // Add AI response
    setMentorMessages(prev => [
      ...prev,
      { from: "mentor", text: data.reply }
    ]);
  } catch (err) {
    // Fallback message if API fails
    setTimeout(() => {
      setMentorMessages(prev => [
        ...prev,
        { 
          from: "mentor", 
          text: `I'm here to help! Based on your ${learningMode} level and ₹${overallProfitLoss} P/L, focus on risk management and check the 5-year chart for trends.` 
        }
      ]);
    }, 500);
  }
};



  /* =======================
     🧩 UI
     ======================= */
  return (
    <div className="game-page">
      <h1 className="page-title">
        Trading <span>Dashboard</span>
      </h1>

      <div className="stats-grid">
        <div className="stat-card">Portfolio ₹{portfolioValue}</div>
        <div className="stat-card">Wallet ₹{wallet}</div>
        <div className="stat-card">Total ₹{totalValue}</div>
        <div className="stat-card">
          P/L{" "}
          <span
            className={
              overallProfitLoss >= 0 ? "profit" : "loss"
            }
          >
            ₹{overallProfitLoss}
          </span>
        </div>
        <div className="stat-card league-card">
  <span className="league-label">League</span>
  <span className="league-name">{league}</span>
</div>


      </div>
{showAnalysis && selectedStock && (
  <StockAnalysisModal
    stock={selectedStock}
    onClose={() => setShowAnalysis(false)}
  />
)}


      <div className="chart-layout">
  {/* LEFT: CHART */}
  <div className="chart-area">
    {/*selectedStock && priceHistory[selectedStock.id] && (
      <CandlestickChart data={priceHistory[selectedStock.id]} />
    )*/}
    {selectedStock && (
  <>
    <p style={{ color: "white" }}>
      Candles: {priceHistory[selectedStock.id]?.length || 0}
    </p>
    <CandlestickChart data={priceHistory[selectedStock.id] || []} />
  </>
)}

  </div>

  {/* RIGHT: INSIGHTS */}
  <div className="insights-area">
    {advice && (
      <div className="advice-box">
        <strong>Smart Advice</strong>
        <p>{advice}</p>
      </div>
    )}

    
  

    <div className="mode-selector">
      <span>Learning Mode:</span>
      <select
        value={learningMode}
        onChange={(e) => setLearningMode(e.target.value)}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
    </div>

    {/* Mentor UI */}
<div className="mentor-box">
  <h4>🧠 Trading Mentor</h4>

  <div className="mentor-messages">
    {mentorMessages.map((msg, index) => (
      <div
        key={index}
        className={msg.from === "mentor" ? "mentor-msg" : "mentor-msg user-msg"}
      >
        {msg.text}
      </div>
    ))}
  </div>

  <div className="mentor-input">
    <input
      type="text"
      placeholder="Ask your mentor..."
      value={mentorInput}
      onChange={(e) => setMentorInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMentorMessage()}
    />
    <button onClick={sendMentorMessage}>Send</button>
  </div>
</div>

  </div>
</div>


     

      {tradeExplanation && (
  <div className="explanation-box">
    <strong>📘 Trade Explanation</strong>
    <p>{tradeExplanation}</p>
  </div>
)}
{showQuiz && (
  <div className="quiz-box">
    <strong>Quick Quiz 🧠</strong>
    <p>Why did this trade result in profit or loss?</p>

    <button onClick={() => setQuizAnswer("price")}>
      Price moved after buying
    </button>

    <button onClick={() => setQuizAnswer("timing")}>
      Poor timing of trade
    </button>

    <button onClick={() => setQuizAnswer("volatility")}>
      Market volatility
    </button>

    {quizAnswer && (
      <p className="quiz-feedback">
        ✅ Correct thinking! Understanding price movement and timing is key.
      </p>
    )}
  </div>
)}


      <div className="main-grid">


    
      
  {/* Market */}
<div className="market">
  <h3>Market Overview</h3>

  {/* Search */}
  <input
    type="text"
    placeholder="Search stock..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="stock-search"
  />

  {/* Sector Filter */}
  <select
    value={selectedSector}
    onChange={(e) => setSelectedSector(e.target.value)}
    className="sector-filter"
  >
    <option value="All">All Sectors</option>
    <option value="Banking">Banking</option>
    <option value="IT">IT</option>
    <option value="FMCG">FMCG</option>
    <option value="Pharma">Pharma</option>
    <option value="Energy">Energy</option>
    <option value="Automobile">Automobile</option>
    <option value="Metals">Metals</option>
    <option value="Infrastructure">Infrastructure</option>
    <option value="Cement">Cement</option>
  </select>


    {filteredStocks.map((stock) => (
      <div
        key={stock.id}
        className={`stock-row ${
          selectedStock?.id === stock.id ? "selected" : ""
        }`}
       onClick={() => {
  setSelectedStock(stock);
}}


      >
        <span>{stock.name}</span>
        <span>₹{stock.price}</span>
      <button
  onClick={(e) => {
    e.stopPropagation();
    console.log("ANALYSIS CLICKED", stock);
    setSelectedStock(stock);
    setShowAnalysis(true);
  }}
>
  Analysis
</button>



      </div>
    ))}
  </div>

  {/* Sidebar */}
  <div className="sidebar">
    <h3>Selected Stock</h3>

    {selectedStock ? (
      <>
        <p><strong>{selectedStock.name}</strong></p>
        <p>Current Price: ₹{selectedStock.price}</p>

         
      </>
    ) : (
      <p>Select a stock</p>
    )}

    <h3 style={{ marginTop: "20px" }}>Portfolio</h3>

    {portfolio.length === 0 && (
      <p>No stocks purchased yet</p>
    )}

    {portfolio.map((item) => {
      const liveStock = stocks.find(
  (s) => s.id === item.id
);

const currentPrice = Number(
  liveStock?.price ?? item.buyPrice
);

const profitLoss =
  (currentPrice - item.buyPrice) * item.quantity;

      return (
        <div key={item.id} className="portfolio-item">
          <p>
            <strong>{item.name}</strong> × {item.quantity}
          </p>
          <p>
           Buy: ₹{item.buyPrice} | Now: ₹{currentPrice.toFixed(2)}

          </p>
          <p
            className={
              profitLoss >= 0 ? "profit" : "loss"
            }
          >
            {profitLoss >= 0 ? "Profit" : "Loss"}: ₹

            

            {Math.abs(profitLoss)}
          </p>
        </div>
      );

    })}
  </div>
</div>



      <div className="actions">
        <button className="buy" onClick={buyStock}>
          BUY
        </button>
        <button className="sell" onClick={sellStock}>
          SELL
        </button>
      </div>
    </div>


    
  );

}

export default Game;
