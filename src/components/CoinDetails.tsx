import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../components/CoinDetails.css';

// Register Chart.js components to ensure they are available globally
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CoinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extract the coin ID from the URL params
  const [timeframe, setTimeframe] = useState('1'); // Default timeframe for price history (1 day)
  const [refresh, setRefresh] = useState(false); // Trigger re-fetch when refreshed
  const [priceHistory, setPriceHistory] = useState<any>(null); // Store price history data
  const [historyLoading, setHistoryLoading] = useState(false); // Loading state for price history
  const [historyError, setHistoryError] = useState<string | null>(null); // Error state for price history
  const [darkMode, setDarkMode] = useState(false); // State for dark mode

  // Fetch coin details using custom useFetch hook
  const { data: coinData, loading: coinLoading, error: coinError } = useFetch(
    `https://api.coingecko.com/api/v3/coins/${id}`
  );

  // Fetch price history when the timeframe or refresh changes
  useEffect(() => {
    const fetchPriceHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${timeframe}`
        );
        const data = await response.json();
        setPriceHistory(data);
      } catch (err) {
        setHistoryError(handleError(err));
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPriceHistory(); // Fetch price history when the params change
  }, [id, timeframe, refresh]); 

  // Prepare chart data from the price history for display
  const chartData = {
    labels: priceHistory?.prices.map((p: number[]) =>
      new Date(p[0]).toLocaleDateString() 
    ),
    datasets: [
      {
        label: '',
        data: priceHistory?.prices.map((p: number[]) => p[1]), // Extract price values
        borderColor: darkMode ? '#4caf50' : '#007bff',
        fill: false, // Line chart without filling
        tension: 0.1, // Slightly curved lines
        borderWidth: 2, // Thicker line
      },
    ],
  };

  // Handle different error scenarios and return a readable message
  const handleError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message; 
    }
    return 'An unknown error occurred'; 
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Apply dark mode class to body based on darkMode state
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className={`coin-detail-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Dark Mode Toggle Slider */}
      <div className="toggle-container">
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider round"></span>
        </label>
        <span className="mode-text">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
      </div>

      {/* Display loading state or error message for coin details */}
      {coinLoading ? (
        <p>Loading coin details...</p>
      ) : coinError ? (
        <p>Error: {handleError(coinError)}</p>
      ) : (
        coinData && (
          <>
            <h1>{coinData.name}</h1>
            <p>{coinData.description.en}</p>
            <p>Market Cap Rank: {coinData.market_cap_rank}</p>
            <p>Market Cap: ${coinData.market_data.market_cap.usd.toLocaleString()}</p>
            <p>Total Volume: ${coinData.market_data.total_volume.usd.toLocaleString()}</p>
          </>
        )
      )}

      {/* Timeframe selection and refresh functionality */}
      <div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="search-bar"
        >
          <option value="1">1 Day</option>
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
          <option value="365">365 Days</option>
        </select>
        <button
          onClick={() => setRefresh(!refresh)}
          className="refresh-button"
        >
          Refresh
        </button>
      </div>

      {/* Display chart */}
      <div className="chart-container">
        {historyLoading ? (
          <p>Loading price history...</p>
        ) : historyError ? (
          <p>Error: {handleError(historyError)}</p>
        ) : (
          priceHistory && (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: darkMode ? 'white' : 'black', 
                    },
                  },
                },
              }}
            />
          )
        )}
      </div>
    </div>
  );
};

export default CoinDetail;
