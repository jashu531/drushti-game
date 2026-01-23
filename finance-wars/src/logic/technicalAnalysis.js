/**
 * Technical Analysis Utilities for FinanceGame
 */

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  
  const k = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices, period = 14) {
  if (prices.length <= period) return null;
  
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null;
  
  const sma = calculateSMA(prices, period);
  const recentPrices = prices.slice(-period);
  const squaredDifferences = recentPrices.map(price => Math.pow(price - sma, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (std * stdDev),
    middle: sma,
    lower: sma - (std * stdDev)
  };
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
  if (prices.length < slow) return null;
  
  // Calculate EMAs
  const emaFast = calculateEMA(prices.slice(-slow), fast);
  const emaSlow = calculateEMA(prices.slice(-slow), slow);
  
  if (!emaFast || !emaSlow) return null;
  
  const macdLine = emaFast - emaSlow;
  // For simplicity, returning just the current MACD value
  return {
    macd: macdLine,
    signal: null, // Full calculation would require more historical data
    histogram: null
  };
}

/**
 * Detect support and resistance levels
 */
export function detectSupportResistance(prices, windowSize = 5) {
  if (prices.length < windowSize * 2) return { support: null, resistance: null };
  
  const mins = [];
  const maxs = [];
  
  for (let i = windowSize; i < prices.length - windowSize; i++) {
    const left = prices.slice(i - windowSize, i);
    const right = prices.slice(i + 1, i + 1 + windowSize);
    const current = prices[i];
    
    // Check for local minimum
    if (left.every(price => price > current) && right.every(price => price > current)) {
      mins.push(current);
    }
    
    // Check for local maximum
    if (left.every(price => price < current) && right.every(price => price < current)) {
      maxs.push(current);
    }
  }
  
  return {
    support: mins.length > 0 ? Math.min(...mins) : null,
    resistance: maxs.length > 0 ? Math.max(...maxs) : null
  };
}

/**
 * Calculate price momentum
 */
export function calculateMomentum(prices, period = 10) {
  if (prices.length <= period) return null;
  
  const currentPrice = prices[prices.length - 1];
  const pastPrice = prices[prices.length - 1 - period];
  
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

/**
 * Analyze trend direction
 */
export function analyzeTrend(prices, shortPeriod = 5, longPeriod = 20) {
  if (prices.length < longPeriod) return 'unknown';
  
  const shortMA = calculateSMA(prices, shortPeriod);
  const longMA = calculateSMA(prices, longPeriod);
  const currentPrice = prices[prices.length - 1];
  
  if (shortMA > longMA && currentPrice > shortMA) {
    return 'bullish';
  } else if (shortMA < longMA && currentPrice < shortMA) {
    return 'bearish';
  } else {
    return 'neutral';
  }
}

/**
 * Get comprehensive technical analysis for a stock
 */
export function getTechnicalAnalysis(prices) {
  if (!prices || prices.length < 20) {
    return {
      trend: 'insufficient_data',
      rsi: null,
      support: null,
      resistance: null,
      movingAverages: null,
      momentum: null
    };
  }
  
  const rsi = calculateRSI(prices);
  const supportResistance = detectSupportResistance(prices);
  const trend = analyzeTrend(prices);
  const momentum = calculateMomentum(prices);
  
  return {
    trend,
    rsi: rsi ? rsi.toFixed(2) : null,
    support: supportResistance.support ? supportResistance.support.toFixed(2) : null,
    resistance: supportResistance.resistance ? supportResistance.resistance.toFixed(2) : null,
    momentum: momentum ? momentum.toFixed(2) : null,
    movingAverages: {
      ma5: calculateSMA(prices, 5)?.toFixed(2),
      ma20: calculateSMA(prices, 20)?.toFixed(2),
      ma50: calculateSMA(prices, 50)?.toFixed(2)
    }
  };
}