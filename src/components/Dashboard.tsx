import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { Crypto } from '../types/crypto';
import '../components/Dashboard.css';

const Dashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [filter, setFilter] = useState<'market_cap' | 'price_change'>('market_cap');

  const pageSize = 10;

  // Fetching data from CoinGecko API with pagination
  const { data, loading, error } = useFetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${pageSize}&page=${page}`
  );

  // Filtering and sorting the fetched data based on search query and selected filter
  const filteredCoins = data
    ? data
        .filter((coin: Crypto) =>
          coin.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a: Crypto, b: Crypto) => {
          if (filter === 'market_cap') {
            return b.market_cap - a.market_cap;
          } else {
            return b.price_change_percentage_24h - a.price_change_percentage_24h;
          }
        })
    : [];

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`container ${theme}`}>
      <h1 className={`dashboard-heading ${theme}`}>Crypto Dashboard</h1>

      {/* Theme Toggle */}
      <div className="theme-toggle-wrapper">
        <div className="theme-toggle" onClick={toggleTheme}>
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <div className={`theme-toggle-slider ${theme === 'dark' ? 'dark' : 'light'}`}></div>
        </div>
      </div>

      {/* Search Bar with Icon */}
      <div className="search-bar-wrapper">
        <span className={`search-icon fa fa-search ${theme}`}></span>
        <input
          className={`search-bar ${theme}`}
          placeholder="Search Cryptocurrency..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Dropdown */}
      <div className="filters">
        <select
          onChange={(e) => setFilter(e.target.value as 'market_cap' | 'price_change')}
          value={filter}
        >
          <option value="market_cap">Filter by Market Cap</option>
          <option value="price_change">Filter by 24h Change</option>
        </select>
      </div>

      {/* Loading and Error Handling */}
      {loading && <p>Loading...</p>}
      {error && <p>Error fetching data: {error}</p>}
      {!loading && filteredCoins.length === 0 && <p>No coins found.</p>}

      {/* Coins Grid */}
      <div className="coins-grid">
        {filteredCoins.map((coin: Crypto) => (
          <Link to={`/coin/${coin.id}`} key={coin.id} className={`coin-card ${theme}`}>
            <h3>{coin.name}</h3>
            <p className={`coin-price ${theme}`}>Price: ${coin.current_price.toFixed(2)}</p>
            <p className={`coin-change ${theme}`}>
              24h Change: {coin.price_change_percentage_24h.toFixed(2)}%
            </p>
            <p className={`coin-market-cap ${theme}`}>
              Market Cap: ${coin.market_cap.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button
          onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((prevPage) => prevPage + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Dashboard;
