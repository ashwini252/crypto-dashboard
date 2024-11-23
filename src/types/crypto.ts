export interface Crypto {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
  }
  
  export interface CoinDetail {
    id: string;
    name: string;
    description: { en: string };
    market_cap_rank: number;
    market_data: {
      market_cap: { usd: number };
      total_volume: { usd: number };
    };
  }
  