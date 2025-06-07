import React, { useState, useEffect } from 'react';

// Helper function to format price (optional, if you decide to show prices)
// const formatPrice = (price) => {
//   return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
// };

const Marquee = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoinData = async () => {
    // setLoading(true); // Set loading true at the beginning of fetch if you want a spinner on each refresh
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCoins(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch coin data:", e);
      setError("Failed to load data. Please try again later.");
      // Keep existing coins if fetch fails, or clear them: setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchCoinData();
    }, 60000); // Refresh data every 60 seconds (1 minute)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  if (loading && coins.length === 0) { // Show loading only on initial load
    return <div className="marquee-loading text-center p-3">Loading live crypto data...</div>;
  }

  if (error && coins.length === 0) { // Show error only if there's no data to display
    return <div className="marquee-error text-center p-3 text-danger">{error}</div>;
  }

  // If there's an error but we have old data, we can still show the old data
  // Or you can choose to show the error more prominently

  return (
    <div className="marquee">
      {coins.map((coin, index) => {
        const priceChange = coin.price_change_percentage_24h;
        const isUp = priceChange >= 0;
        const percentageString = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
        // You might want to add a small threshold for "neutral" if priceChange is very close to 0

        return (
          <div key={coin.id} className={`item item${index + 1} text-dark`}>
            <p>
              {coin.name}
              <span className={`ms-2 ${isUp ? 'text-success' : 'text-danger'}`}>{percentageString}</span>
              {/* Optional: Display price: {formatPrice(coin.current_price)} */}
              <i className={`bx ${isUp ? 'bxs-up-arrow text-success' : 'bxs-down-arrow text-danger'}`}></i>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Marquee;