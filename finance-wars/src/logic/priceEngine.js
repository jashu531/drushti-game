export function updateStockPrices(stocks) {
  return stocks.map((stock) => {
    const currentPrice = Number(stock.price);

    // 🛑 SAFETY CHECK
    if (!Number.isFinite(currentPrice)) {
      return {
        ...stock,
        price: 1000, // fallback safe price
      };
    }

    const changePercent = (Math.random() - 0.5) * 0.02; // ±1%
    const newPrice = currentPrice + currentPrice * changePercent;

    return {
      ...stock,
      price: Math.max(1, Math.round(newPrice)),
    };
  });
}
