/**
 * coins.json の静的マスターデータ
 * CoinGecko ID / 日本語名 / シンボル
 */
import type { Coin } from '@/types';

export const COIN_MASTER: Coin[] = [
  { id: 'bitcoin',        symbol: 'BTC',  name_en: 'Bitcoin',         name_ja: 'ビットコイン',       slug: 'bitcoin',        market_cap_rank: 1,  logo_url: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',          categories: [] },
  { id: 'ethereum',       symbol: 'ETH',  name_en: 'Ethereum',        name_ja: 'イーサリアム',       slug: 'ethereum',       market_cap_rank: 2,  logo_url: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',        categories: [] },
  { id: 'tether',         symbol: 'USDT', name_en: 'Tether',          name_ja: 'テザー',             slug: 'tether',         market_cap_rank: 3,  logo_url: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',          categories: [] },
  { id: 'ripple',         symbol: 'XRP',  name_en: 'XRP',             name_ja: 'リップル',           slug: 'xrp',            market_cap_rank: 4,  logo_url: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', categories: [] },
  { id: 'binancecoin',    symbol: 'BNB',  name_en: 'BNB',             name_ja: 'BNB',                slug: 'bnb',            market_cap_rank: 5,  logo_url: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',    categories: [] },
  { id: 'solana',         symbol: 'SOL',  name_en: 'Solana',          name_ja: 'ソラナ',             slug: 'solana',         market_cap_rank: 6,  logo_url: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',         categories: [] },
  { id: 'usd-coin',       symbol: 'USDC', name_en: 'USD Coin',        name_ja: 'USDコイン',          slug: 'usdc',           market_cap_rank: 7,  logo_url: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',           categories: [] },
  { id: 'dogecoin',       symbol: 'DOGE', name_en: 'Dogecoin',        name_ja: 'ドージコイン',       slug: 'dogecoin',       market_cap_rank: 8,  logo_url: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',          categories: ['Meme'] },
  { id: 'staked-ether',   symbol: 'STETH',name_en: 'Lido Staked Ether',name_ja:'リドステークETH',  slug: 'steth',          market_cap_rank: 9,  logo_url: 'https://assets.coingecko.com/coins/images/13442/small/steth_logo.png',    categories: [] },
  { id: 'tron',           symbol: 'TRX',  name_en: 'TRON',            name_ja: 'トロン',             slug: 'tron',           market_cap_rank: 10, logo_url: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',      categories: [] },
  { id: 'cardano',        symbol: 'ADA',  name_en: 'Cardano',         name_ja: 'カルダノ',           slug: 'cardano',        market_cap_rank: 11, logo_url: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',         categories: [] },
  { id: 'avalanche-2',    symbol: 'AVAX', name_en: 'Avalanche',       name_ja: 'アバランチ',         slug: 'avalanche',      market_cap_rank: 12, logo_url: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', categories: [] },
  { id: 'shiba-inu',      symbol: 'SHIB', name_en: 'Shiba Inu',       name_ja: 'シバイヌ',           slug: 'shib',           market_cap_rank: 13, logo_url: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',         categories: ['Meme'] },
  { id: 'wrapped-bitcoin',symbol: 'WBTC', name_en: 'Wrapped Bitcoin', name_ja: 'ラップドBTC',        slug: 'wbtc',           market_cap_rank: 14, logo_url: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png', categories: [] },
  { id: 'polkadot',       symbol: 'DOT',  name_en: 'Polkadot',        name_ja: 'ポルカドット',       slug: 'polkadot',       market_cap_rank: 15, logo_url: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',      categories: [] },
  { id: 'chainlink',      symbol: 'LINK', name_en: 'Chainlink',       name_ja: 'チェーンリンク',     slug: 'chainlink',      market_cap_rank: 16, logo_url: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', categories: [] },
  { id: 'uniswap',        symbol: 'UNI',  name_en: 'Uniswap',         name_ja: 'ユニスワップ',       slug: 'uniswap',        market_cap_rank: 17, logo_url: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',   categories: ['DeFi'] },
  { id: 'litecoin',       symbol: 'LTC',  name_en: 'Litecoin',        name_ja: 'ライトコイン',       slug: 'litecoin',       market_cap_rank: 18, logo_url: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',          categories: [] },
  { id: 'near',           symbol: 'NEAR', name_en: 'NEAR Protocol',   name_ja: 'ニアプロトコル',     slug: 'near',           market_cap_rank: 19, logo_url: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',           categories: [] },
  { id: 'matic-network',  symbol: 'MATIC',name_en: 'Polygon',         name_ja: 'ポリゴン',           slug: 'polygon',        market_cap_rank: 20, logo_url: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png', categories: ['Layer2'] },
];

export const COIN_MAP = new Map(COIN_MASTER.map(c => [c.id, c]));
export const COIN_BY_SYMBOL = new Map(COIN_MASTER.map(c => [c.symbol.toLowerCase(), c]));
export const COIN_SLUG_MAP = new Map(COIN_MASTER.map(c => [c.slug, c]));

/** ニュースタイトルからコインIDを抽出するためのキーワードマッピング */
export const COIN_KEYWORDS: Record<string, string[]> = {
  bitcoin:        ['bitcoin', 'btc', 'ビットコイン'],
  ethereum:       ['ethereum', 'eth', 'イーサリアム', 'ether'],
  ripple:         ['ripple', 'xrp', 'リップル'],
  solana:         ['solana', 'sol', 'ソラナ'],
  dogecoin:       ['dogecoin', 'doge', 'ドージ'],
  cardano:        ['cardano', 'ada', 'カルダノ'],
  'avalanche-2':  ['avalanche', 'avax', 'アバランチ'],
  'shiba-inu':    ['shiba', 'shib', 'シバイヌ'],
  polkadot:       ['polkadot', 'dot', 'ポルカドット'],
  chainlink:      ['chainlink', 'link', 'チェーンリンク'],
  uniswap:        ['uniswap', 'uni', 'ユニスワップ'],
  litecoin:       ['litecoin', 'ltc', 'ライトコイン'],
  'near':         ['near protocol', 'near'],
  'matic-network':['polygon', 'matic', 'ポリゴン'],
  binancecoin:    ['binance', 'bnb'],
  tron:           ['tron', 'trx', 'トロン'],
};
