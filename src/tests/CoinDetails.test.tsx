// src/tests/CoinDetail.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Wrap component in Router for useParams
import CoinDetail from '../components/CoinDetails'; // Import your component
import { useFetch } from '../hooks/useFetch';

// Mock the custom `useFetch` hook to control API responses
jest.mock('../hooks/useFetch');

describe('CoinDetail Component', () => {
  it('displays loading message when fetching coin details', () => {
    // Mock useFetch hook to simulate loading state
    (useFetch as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    expect(screen.getByText('Loading coin details...')).toBeInTheDocument();
  });

  it('displays error message when there is an error fetching coin details', () => {
    const errorMessage = 'Failed to fetch coin data';
    (useFetch as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error(errorMessage),
    });

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays coin details successfully when data is fetched', async () => {
    const mockCoinData = {
      name: 'Bitcoin',
      description: { en: 'A popular cryptocurrency.' },
      market_cap_rank: 1,
      market_data: {
        market_cap: { usd: 500000000000 },
        total_volume: { usd: 25000000000 },
      },
    };

    // Mock useFetch hook to simulate successful response
    (useFetch as jest.Mock).mockReturnValue({
      data: mockCoinData,
      loading: false,
      error: null,
    });

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    // Assert that coin data is rendered correctly
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('A popular cryptocurrency.')).toBeInTheDocument();
      expect(screen.getByText('Market Cap Rank: 1')).toBeInTheDocument();
      expect(screen.getByText('Market Cap: $500,000,000,000')).toBeInTheDocument();
      expect(screen.getByText('Total Volume: $25,000,000,000')).toBeInTheDocument();
    });
  });

  it('displays loading state for price history', () => {
    const mockCoinData = { name: 'Bitcoin', description: { en: '' } }; // Mock minimal coin data
    const mockPriceHistory = null; // Simulate no price history loaded yet

    (useFetch as jest.Mock).mockReturnValueOnce({
      data: mockCoinData,
      loading: false,
      error: null,
    });

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    expect(screen.getByText('Loading price history...')).toBeInTheDocument();
  });

  it('displays error message when there is an error fetching price history', async () => {
    const errorMessage = 'Failed to fetch price history';
    const mockCoinData = { name: 'Bitcoin', description: { en: '' } };

    // Mock useFetch for coin data and price history
    (useFetch as jest.Mock).mockReturnValueOnce({
      data: mockCoinData,
      loading: false,
      error: null,
    });

    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    // Wait for price history error to appear
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('displays price history chart successfully when data is fetched', async () => {
    const mockCoinData = { name: 'Bitcoin', description: { en: '' } };
    const mockPriceHistory = { prices: [[1624905600000, 35000], [1624992000000, 36000]] };

    (useFetch as jest.Mock).mockReturnValueOnce({
      data: mockCoinData,
      loading: false,
      error: null,
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockPriceHistory),
    });

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    // Check if chart is rendered after fetching price history
    await waitFor(() => {
      expect(screen.getByText('Price (USD)')).toBeInTheDocument();
    });
  });

  it('refreshes data when the refresh button is clicked', async () => {
    const mockCoinData = { name: 'Bitcoin', description: { en: '' } };
    const mockPriceHistory = { prices: [[1624905600000, 35000], [1624992000000, 36000]] };

    (useFetch as jest.Mock).mockReturnValueOnce({
      data: mockCoinData,
      loading: false,
      error: null,
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockPriceHistory),
    });

    render(
      <Router>
        <CoinDetail />
      </Router>
    );

    // Simulate clicking the refresh button
    const refreshButton = screen.getByText('Refresh Data');
    fireEvent.click(refreshButton);

    // Check that fetchPriceHistory is called again after refresh
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Ensures re-fetch is triggered
    });
  });
});
