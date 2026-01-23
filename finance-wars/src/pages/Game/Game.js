import { useEffect, useState } from "react";
import "./Game.css";
import initialStocks from "../../data/stocks";
import { updateStockPrices } from "../../logic/priceEngine";
import { auth } from "../../firebase/firebase";
import { saveUserData, loadUserData } from "../../firebase/realtimeDb";
import { updateLeaderboard } from "../../firebase/leaderboardDb";
import CandlestickChart from "../../components/CandlestickChart";
import StockAnalysisModal from "../../components/StockAnalysisModal";
import { getTechnicalAnalysis } from "../../logic/technicalAnalysis";
import { calculateSMA, calculateRSI } from "../../logic/technicalAnalysis";


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
   📊 TECHNICAL ANALYSIS
   ======================= */
const [technicalAnalysis, setTechnicalAnalysis] = useState({});

useEffect(() => {
  if (selectedStock && priceHistory[selectedStock.id] && priceHistory[selectedStock.id].length > 0) {
    const prices = priceHistory[selectedStock.id].map(candle => candle.close);
    const analysis = getTechnicalAnalysis(prices);
    
    setTechnicalAnalysis(prev => ({
      ...prev,
      [selectedStock.id]: analysis
    }));
  }
}, [selectedStock, priceHistory]);

/* =======================
   ⚖️ RISK MANAGEMENT
   ======================= */
const calculateRiskMetrics = (stockId) => {
  const stock = stocks.find(s => s.id === stockId);
  const portfolioItem = portfolio.find(p => p.id === stockId);
  
  if (!stock || !portfolioItem) return null;
  
  const currentValue = stock.price * portfolioItem.quantity;
  const costBasis = portfolioItem.buyPrice * portfolioItem.quantity;
  const profitLoss = currentValue - costBasis;
  const profitLossPercent = (profitLoss / costBasis) * 100;
  
  // Calculate position size risk
  const positionSizePercent = (currentValue / portfolioValue) * 100;
  
  // Calculate volatility risk based on recent price movements
  let volatilityRisk = 0;
  if (priceHistory[stockId] && priceHistory[stockId].length > 10) {
    const recentPrices = priceHistory[stockId].slice(-10).map(c => c.close);
    const avg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const squaredDiffs = recentPrices.map(price => Math.pow(price - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    const volatility = Math.sqrt(variance);
    volatilityRisk = (volatility / avg) * 100; // Coefficient of variation
  }
  
  // Determine risk level
  let riskLevel = 'low';
  if (positionSizePercent > 15 || volatilityRisk > 5 || Math.abs(profitLossPercent) > 15) {
    riskLevel = 'high';
  } else if (positionSizePercent > 10 || volatilityRisk > 3 || Math.abs(profitLossPercent) > 10) {
    riskLevel = 'medium';
  }
  
  return {
    positionSizePercent,
    volatilityRisk,
    profitLossPercent,
    riskLevel,
    currentValue,
    costBasis
  };
};




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

  // Calculate portfolio concentration
  const selectedStockInPortfolio = portfolio.find(p => p.id === selectedStock.id);
  let portfolioConcentration = 0;
  if (selectedStockInPortfolio) {
    const stockValue = selectedStockInPortfolio.quantity * selectedStockInPortfolio.buyPrice;
    portfolioConcentration = (stockValue / portfolioValue) * 100;
  }

  // Calculate overall win rate
  let winningPositions = 0;
  let totalPositions = portfolio.length;
  portfolio.forEach(position => {
    const liveStock = stocks.find(s => s.id === position.id);
    const currentPrice = liveStock ? liveStock.price : position.buyPrice;
    if ((currentPrice - position.buyPrice) * position.quantity > 0) {
      winningPositions++;
    }
  });
  const winRate = totalPositions > 0 ? (winningPositions / totalPositions) * 100 : 0;

  if (text.includes("buy")) {
    if (overallProfitLoss < 0) {
      return learningMode === "beginner"
        ? `You are already in loss. Avoid buying emotionally. Wait for confirmation. Current win rate: ${winRate.toFixed(1)}%.`
        : portfolioConcentration > 30
          ? `High concentration in this stock (${portfolioConcentration.toFixed(1)}%). Consider diversification before adding more.`
          : `Consider risk-reward before adding to a losing position. Your win rate is ${winRate.toFixed(1)}%.`;
    }
    
    // Check if selected stock is overvalued based on volatility
    const priceChangePercent = Math.abs(((selectedStock.price - (selectedStockInPortfolio ? selectedStockInPortfolio.buyPrice : selectedStock.price)) / (selectedStockInPortfolio ? selectedStockInPortfolio.buyPrice : selectedStock.price)) * 100);
    
    // Include technical analysis if available
    const currentTechnicalAnalysis = selectedStock && technicalAnalysis[selectedStock.id] ? technicalAnalysis[selectedStock.id] : null;
    let technicalAdvice = "";
    if (currentTechnicalAnalysis && currentTechnicalAnalysis.trend !== 'insufficient_data') {
      technicalAdvice = ` Technical indicators show: ${currentTechnicalAnalysis.trend} trend, RSI: ${currentTechnicalAnalysis.rsi || 'N/A'}.`;
    }
    
    // Risk management checks
    const riskMetrics = selectedStockInPortfolio ? calculateRiskMetrics(selectedStock.id) : null;
    let riskAdvice = "";
    if (riskMetrics) {
      if (riskMetrics.riskLevel === 'high') {
        riskAdvice = ` Risk alert: This position is high-risk due to ${riskMetrics.positionSizePercent > 15 ? 'large position size' : riskMetrics.volatilityRisk > 5 ? 'high volatility' : 'large profit/loss swing'}. Consider reducing exposure.`;
      } else if (riskMetrics.riskLevel === 'medium') {
        riskAdvice = ` Note: This position has medium risk. Monitor closely.`;
      }
    }
    
    if (portfolioConcentration > 40) {
      return `⚠️ High concentration alert! You already own ${portfolioConcentration.toFixed(1)}% of your portfolio in this stock. Consider diversifying to reduce risk.${technicalAdvice}${riskAdvice}`;
    }
    
    if (priceChangePercent > 10) {
      return `Price has moved ${priceChangePercent.toFixed(1)}% recently. Consider the fundamentals before buying.${technicalAdvice}${riskAdvice}`;
    }
    
    // Additional technical checks
    if (currentTechnicalAnalysis && currentTechnicalAnalysis.rsi) {
      const rsi = parseFloat(currentTechnicalAnalysis.rsi);
      if (rsi > 70) {
        return `RSI shows stock is overbought (${rsi}). Consider waiting for a pullback before buying.${technicalAdvice}${riskAdvice}`;
      } else if (rsi < 30) {
        return `RSI shows stock is oversold (${rsi}). Potential buying opportunity, but confirm with fundamentals.${technicalAdvice}${riskAdvice}`;
      }
    }
    
    return `Price looks stable. Consider buying only if volume supports it, fundamentals are strong, technicals align, and risk is managed.${technicalAdvice}${riskAdvice}`;
  }

  if (text.includes("sell")) {
    if (overallProfitLoss > 0) {
      if (selectedStockInPortfolio) {
        const profitPercent = ((selectedStock.price - selectedStockInPortfolio.buyPrice) / selectedStockInPortfolio.buyPrice) * 100;
        if (profitPercent > 15) {
          return `Great profit of ${profitPercent.toFixed(1)}%! Consider booking partial profits to secure gains. Rule of thumb: Take 30-50% off the table.`;
        } else if (profitPercent > 8) {
          return `Healthy profit of ${profitPercent.toFixed(1)}%. Consider booking partial profits at 15%+ to protect gains.`;
        }
      }
      return "You are in profit. Booking partial profit is a smart move 👍";
    }
    
    if (selectedStockInPortfolio) {
      const lossPercent = ((selectedStockInPortfolio.buyPrice - selectedStock.price) / selectedStockInPortfolio.buyPrice) * 100;
      if (lossPercent > 10) {
        // Include technical analysis if available
        const currentTechnicalAnalysis = selectedStock && technicalAnalysis[selectedStock.id] ? technicalAnalysis[selectedStock.id] : null;
        let technicalAdvice = "";
        if (currentTechnicalAnalysis && currentTechnicalAnalysis.trend !== 'insufficient_data') {
          technicalAdvice = ` Technical indicators show: ${currentTechnicalAnalysis.trend} trend, RSI: ${currentTechnicalAnalysis.rsi || 'N/A'}.`;
        }
            
        // Risk management checks
        const riskMetrics = selectedStockInPortfolio ? calculateRiskMetrics(selectedStock.id) : null;
        let riskAdvice = "";
        if (riskMetrics && riskMetrics.riskLevel === 'high') {
          riskAdvice = ` Risk alert: This position is high-risk. Consider exiting completely or setting tight stop-loss.`;
        }
            
        return `Significant loss of ${lossPercent.toFixed(1)}%. Consider stop-loss at 15% or reassess fundamentals.${technicalAdvice}${riskAdvice} Don't let temporary losses become permanent.`;
      }
    }
    
    // Include technical analysis in general sell advice
    const currentTechnicalAnalysis = selectedStock && technicalAnalysis[selectedStock.id] ? technicalAnalysis[selectedStock.id] : null;
    let technicalAdvice = "";
    if (currentTechnicalAnalysis && currentTechnicalAnalysis.trend !== 'insufficient_data') {
      technicalAdvice = ` Technical indicators suggest: ${currentTechnicalAnalysis.trend} trend, RSI: ${currentTechnicalAnalysis.rsi || 'N/A'}.`;
    }
    
    // Risk management checks
    const riskMetrics = selectedStockInPortfolio ? calculateRiskMetrics(selectedStock.id) : null;
    let riskAdvice = "";
    if (riskMetrics && riskMetrics.riskLevel === 'high') {
      riskAdvice = ` Risk alert: This position is high-risk. Consider exiting to preserve capital.`;
    }
    
    return `Selling now may lock losses. Check trend strength and fundamentals before deciding.${technicalAdvice}${riskAdvice}`;
  }

  if (text.includes("loss")) {
    if (overallProfitLoss < 0) {
      const lossPercent = Math.abs((overallProfitLoss / 100000) * 100);
      return lossPercent > 10
        ? `Significant portfolio loss of ${lossPercent.toFixed(1)}%. Consider reducing position sizes and focusing on preservation of capital. Take a break if emotions are high.`
        : "Losses are part of trading. Focus on discipline, not recovery trades. Stick to your strategy.";
    }
    return "Losses are part of trading. Focus on discipline, not recovery trades.";
  }

  if (text.includes("profit")) {
    if (overallProfitLoss > 0) {
      const profitPercent = (overallProfitLoss / 100000) * 100;
      
      // Count profitable positions
      let profitablePositions = 0;
      portfolio.forEach(p => {
        const liveStock = stocks.find(s => s.id === p.id);
        const currentPrice = liveStock ? liveStock.price : p.buyPrice;
        if ((currentPrice - p.buyPrice) * p.quantity > 0) profitablePositions++;
      });
          
      // Check for overconcentration in profitable stocks
      let overConcentratedStocks = 0;
      portfolio.forEach(p => {
        const liveStock = stocks.find(s => s.id === p.id);
        const currentPrice = liveStock ? liveStock.price : p.buyPrice;
        const stockValue = currentPrice * p.quantity;
        const positionSize = (stockValue / portfolioValue) * 100;
        if (positionSize > 20) overConcentratedStocks++;
      });
          
      return profitPercent > 15
        ? `Excellent performance! ${profitPercent.toFixed(1)}% gain. You have ${profitablePositions} profitable positions with ${overConcentratedStocks} over-concentrated stocks. Time to book some profits and reduce position sizes to preserve gains.`
        : `Great job! You have ${profitablePositions} profitable positions. Protect profits using stop-loss or partial booking. Consider taking profits at 15-20% if over-concentrated.`;
    }
    return "Protect profits using stop-loss or partial booking.";
  }

  // Enhanced general responses
  if (text.includes("risk") || text.includes("safe") || text.includes("secure")) {
    // Calculate overall portfolio risk
    const maxConcentration = portfolio.length > 0 ? Math.max(...portfolio.map(p => {
      const stockVal = p.quantity * (stocks.find(s => s.id === p.id)?.price || p.buyPrice);
      return (stockVal / portfolioValue) * 100;
    })) : 0;
    
    // Count high-risk positions
    let highRiskPositions = 0;
    portfolio.forEach(p => {
      const riskMetrics = calculateRiskMetrics(p.id);
      if (riskMetrics && riskMetrics.riskLevel === 'high') highRiskPositions++;
    });
    
    return `Your portfolio has ${totalPositions} positions with a win rate of ${winRate.toFixed(1)}%. You have ${highRiskPositions} high-risk positions. Aim to keep no more than 10-15% in any single stock. Current max concentration: ${maxConcentration.toFixed(1)}% in one stock. Consider rebalancing to reduce risk.`;
  }

  if (text.includes("diversif") || text.includes("spread")) {
    const sectors = [...new Set(portfolio.map(p => p.sector))];
    return `You're invested in ${sectors.length} sectors: ${sectors.join(', ')}. Good diversification includes different sectors and market caps. Consider spreading across 4-6 sectors for optimal diversification.`;
  }

  if (text.includes("hold") || text.includes("keep")) {
    if (selectedStockInPortfolio) {
      const holdingPeriod = ((selectedStock.price - selectedStockInPortfolio.buyPrice) / selectedStockInPortfolio.buyPrice) * 100;
      return holdingPeriod > 5
        ? `Positive holding of ${holdingPeriod.toFixed(1)}%. Consider your investment timeline and rebalance if allocation gets too high.`
        : `Monitor closely. If fundamentals remain strong, holding is fine. Otherwise, consider repositioning.`;
    }
  }

  // New question categories
  if (text.includes("fundament") || text.includes("balance sheet") || text.includes("eps") || text.includes("pe ratio") || text.includes("debt")) {
    return `For fundamental analysis, check the company's quarterly results, debt-to-equity ratio, promoter holdings, and revenue growth. The P/E ratio compared to industry peers is crucial. Currently, focus on quality businesses with strong fundamentals.`;
  }

  if (text.includes("stop loss") || text.includes("stoploss") || text.includes("protect") || text.includes("limit")) {
    return `Set stop-loss at 7-10% for beginners, 12-15% for advanced traders. Never risk more than 2% of your portfolio on a single trade. Consider trailing stops to protect profits while letting winners run.`;
  }

  if (text.includes("volume") || text.includes("high") || text.includes("low")) {
    return `Volume confirms price movements. High volume with price increases suggests strong buying interest. Look for volume spikes during breakouts or breakdowns for confirmation.`;
  }

  if (text.includes("when") && (text.includes("buy") || text.includes("sell"))) {
    return `Timing the market is difficult. Use technical indicators like RSI, moving averages, and support/resistance levels. For buying: look for pullbacks to support with volume. For selling: consider booking profits at resistance levels.`;
  }

  if (text.includes("best") && (text.includes("strategy") || text.includes("approach") || text.includes("way"))) {
    return `Best practices: 1) Diversify across sectors (4-6), 2) Limit single stock to 10-15% of portfolio, 3) Use stop-loss orders, 4) Book partial profits at 15-20%, 5) Focus on quality businesses with sustainable moats.`;
  }

  if (text.includes("market") || text.includes("trend") || text.includes("direction")) {
    const currentTechnicalAnalysis = selectedStock && technicalAnalysis[selectedStock.id] ? technicalAnalysis[selectedStock.id] : null;
    let techAdvice = currentTechnicalAnalysis && currentTechnicalAnalysis.trend !== 'insufficient_data' 
      ? `Technical trend for ${selectedStock.name}: ${currentTechnicalAnalysis.trend}. ` 
      : '';
    return `${techAdvice}Focus on identifying primary trends. In uptrends, look for buying opportunities on corrections. In downtrends, wait for reversals or avoid catching falling knives.`;
  }

  // For general questions that don't match specific keywords, use the AI backend
  // This will provide more varied and intelligent responses
  return null; // Return null to indicate that we should use the AI backend
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

  // First, try to get a response from the local mentor logic
  const localResponse = getMentorReply(userInput);
  
  if (localResponse !== null) {
    // Use the local response if available
    setMentorMessages(prev => [
      ...prev,
      { from: "mentor", text: localResponse }
    ]);
  } else {
    // If local logic returns null, use the AI backend
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
