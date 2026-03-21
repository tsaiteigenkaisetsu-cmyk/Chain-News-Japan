/**
 * SNS・ソーシャルデータ収集スクリプト (v1)
 * 実行: node scripts/fetch-social.mjs
 *
 * データソース:
 *  - Reddit Public JSON API（認証不要）: r/CryptoCurrency コミュニティ
 *  - ローカルニュースデータ（data/news.json）からキーワード集計
 *
 * 出力: data/social.json
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT        = join(__dirname, '..');
const DATA_DIR    = join(ROOT, 'data');
const SOCIAL_FILE = join(DATA_DIR, 'social.json');
const NEWS_FILE   = join(DATA_DIR, 'news.json');

// =====================================================================
// 対象コインリスト（COIN_MASTER と同期）
// =====================================================================
const COINS = [
  { id: 'bitcoin',        symbol: 'BTC',  reddit_q: 'bitcoin',          name_en: 'Bitcoin'      },
  { id: 'ethereum',       symbol: 'ETH',  reddit_q: 'ethereum',         name_en: 'Ethereum'     },
  { id: 'ripple',         symbol: 'XRP',  reddit_q: 'XRP ripple',       name_en: 'XRP'          },
  { id: 'solana',         symbol: 'SOL',  reddit_q: 'solana',           name_en: 'Solana'       },
  { id: 'dogecoin',       symbol: 'DOGE', reddit_q: 'dogecoin',         name_en: 'Dogecoin'     },
  { id: 'cardano',        symbol: 'ADA',  reddit_q: 'cardano',          name_en: 'Cardano'      },
  { id: 'avalanche-2',    symbol: 'AVAX', reddit_q: 'avalanche avax',   name_en: 'Avalanche'    },
  { id: 'shiba-inu',      symbol: 'SHIB', reddit_q: 'shiba inu shib',   name_en: 'Shiba Inu'    },
  { id: 'polkadot',       symbol: 'DOT',  reddit_q: 'polkadot',         name_en: 'Polkadot'     },
  { id: 'chainlink',      symbol: 'LINK', reddit_q: 'chainlink',        name_en: 'Chainlink'    },
  { id: 'uniswap',        symbol: 'UNI',  reddit_q: 'uniswap',          name_en: 'Uniswap'      },
  { id: 'litecoin',       symbol: 'LTC',  reddit_q: 'litecoin',         name_en: 'Litecoin'     },
  { id: 'near',           symbol: 'NEAR', reddit_q: 'near protocol',    name_en: 'NEAR'         },
  { id: 'matic-network',  symbol: 'MATIC',reddit_q: 'polygon matic',    name_en: 'Polygon'      },
  { id: 'binancecoin',    symbol: 'BNB',  reddit_q: 'binance bnb',      name_en: 'BNB'          },
  { id: 'tron',           symbol: 'TRX',  reddit_q: 'tron trx',         name_en: 'TRON'         },
  { id: 'tether',         symbol: 'USDT', reddit_q: 'tether usdt',      name_en: 'Tether'       },
  { id: 'usd-coin',       symbol: 'USDC', reddit_q: 'usdc stablecoin',  name_en: 'USD Coin'     },
  { id: 'staked-ether',   symbol: 'STETH',reddit_q: 'lido staked ether',name_en: 'Lido stETH'  },
  { id: 'wrapped-bitcoin',symbol: 'WBTC', reddit_q: 'wrapped bitcoin',  name_en: 'WBTC'         },
];

const FETCH_TIMEOUT_MS  = 10000;
const REQUEST_DELAY_MS  = 2300;   // Reddit レート制限への配慮（約26req/min 以下）
const USER_AGENT        = 'ChainNewsJapan/1.0 Social Monitor (+https://chain-news-japan-webappjp.vercel.app)';
const PREVIOUS_TTL_MS   = 48 * 60 * 60 * 1000;

const ALLOWED_SUBREDDITS = new Set([
  'cryptocurrency',
  'bitcoin',
  'bitcoincash',
  'ethereum',
  'ethfinance',
  'ethtrader',
  'ethstaker',
  'solana',
  'ripple',
  'xrp',
  'dogecoin',
  'cardano',
  'avalanche',
  'avax',
  'shibarmy',
  'polkadot',
  'chainlink',
  'uniswap',
  'litecoin',
  'nearprotocol',
  '0xpolygon',
  'maticnetwork',
  'binance',
  'bnbchainofficial',
  'tronix',
  'tether',
  'usdc',
  'cryptomarkets',
  'defi',
  'cryptotechnology',
]);

// =====================================================================
// ユーティリティ
// =====================================================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatElapsed(ms) {
  return (ms / 1000).toFixed(1) + 's';
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function normalizeText(value) {
  return decodeHtml(String(value ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCoinKeywords(coin) {
  const parts = [coin.symbol, coin.name_en, coin.reddit_q]
    .flatMap(value => String(value ?? '').split(/\s+/))
    .map(part => normalizeText(part))
    .filter(Boolean);

  return [...new Set(parts)].filter(part => part.length >= 3 || part === coin.symbol.toLowerCase());
}

function isAllowedSubreddit(subreddit) {
  return ALLOWED_SUBREDDITS.has(String(subreddit ?? '').toLowerCase());
}

function matchesCoinKeywords(coin, ...chunks) {
  const text = normalizeText(chunks.join(' '));
  if (!text) return false;

  return getCoinKeywords(coin).some(keyword => {
    if (keyword.length <= 3) {
      return text.split(' ').includes(keyword);
    }
    return text.includes(keyword);
  });
}

function getReusablePreviousSnapshot(previousSnapshot, coinId) {
  if (!previousSnapshot?.reddit_enabled) return null;

  const updatedAt = new Date(previousSnapshot.updated_at).getTime();
  if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > PREVIOUS_TTL_MS) {
    return null;
  }

  return previousSnapshot.coins.find(coin => coin.coin_id === coinId) ?? null;
}

async function loadPreviousSocialSnapshot() {
  if (!existsSync(SOCIAL_FILE)) return null;

  try {
    const raw = await readFile(SOCIAL_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// =====================================================================
// Reddit Public JSON API
// =====================================================================
async function fetchRedditJsonData(coin) {
  const q   = encodeURIComponent(coin.reddit_q);
  // subreddit 制限なし: site-wide 検索でより多くの投稿を捕捉する
  const url = `https://www.reddit.com/search.json?q=${q}&sort=top&t=day&limit=100`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept':     'application/json',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.status === 429) {
      console.warn(`  ⚠ [Reddit] レート制限 429: ${coin.symbol} — スキップ`);
      return null;
    }
    if (!res.ok) {
      console.warn(`  ⚠ [Reddit] HTTP ${res.status}: ${coin.symbol}`);
      return null;
    }

    const data = await res.json();
    const posts = (data?.data?.children ?? [])
      .map(item => item?.data)
      .filter(post => post && isAllowedSubreddit(post.subreddit) && matchesCoinKeywords(coin, post.title, post.selftext, post.subreddit));

    if (posts.length === 0) {
      return { post_count: 0, engagement: 0, source: 'json' };
    }

    // エンゲージメント = upvotes + コメント数（相対的な話題量指標）
    const engagement = posts.reduce((sum, p) => {
      return sum + Math.max(0, p?.score ?? 0) + (p?.num_comments ?? 0);
    }, 0);

    return { post_count: posts.length, engagement, source: 'json' };
  } catch (err) {
    if (err?.name !== 'TimeoutError') {
      console.warn(`  ⚠ [Reddit] ${coin.symbol} エラー: ${err?.message ?? err}`);
    } else {
      console.warn(`  ⚠ [Reddit] ${coin.symbol} タイムアウト`);
    }
    return null;
  }
}

async function fetchRedditRssData(coin) {
  const q = encodeURIComponent(coin.reddit_q);
  const url = `https://www.reddit.com/search.rss?q=${q}&sort=top&t=day`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`  ⚠ [Reddit RSS] HTTP ${res.status}: ${coin.symbol}`);
      return null;
    }

    const xml = await res.text();
    const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/g) ?? [];

    const posts = entries.filter(entry => {
      const idMatch = entry.match(/<id>([^<]+)<\/id>/);
      if (!idMatch?.[1]?.includes('t3_')) return false;

      const categoryMatch = entry.match(/<category[^>]*term="([^"]+)"/i);
      if (!isAllowedSubreddit(categoryMatch?.[1] ?? '')) return false;

      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/i);
      const contentMatch = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
      return matchesCoinKeywords(coin, titleMatch?.[1] ?? '', contentMatch?.[1] ?? '', categoryMatch?.[1] ?? '');
    });

    return { post_count: posts.length, engagement: 0, source: 'rss' };
  } catch (err) {
    if (err?.name !== 'TimeoutError') {
      console.warn(`  ⚠ [Reddit RSS] ${coin.symbol} エラー: ${err?.message ?? err}`);
    } else {
      console.warn(`  ⚠ [Reddit RSS] ${coin.symbol} タイムアウト`);
    }
    return null;
  }
}

async function fetchRedditData(coin) {
  const jsonResult = await fetchRedditJsonData(coin);
  if (jsonResult !== null) {
    return jsonResult;
  }

  return fetchRedditRssData(coin);
}

// =====================================================================
// ニュースデータからコイン別件数集計
// =====================================================================
function buildNewsCounts(news) {
  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  const h48 = 48 * 60 * 60 * 1000;

  const counts = {};
  for (const coin of COINS) {
    const related = news.filter(n => Array.isArray(n.coin_ids) && n.coin_ids.includes(coin.id));
    counts[coin.id] = {
      news_24h: related.filter(n => now - new Date(n.published_at).getTime() < h24).length,
      news_48h: related.filter(n => now - new Date(n.published_at).getTime() < h48).length,
    };
  }
  return counts;
}

// =====================================================================
// ニュースタイトルからトレンドワード抽出
// =====================================================================
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','have','has','had','do','does','did',
  'will','would','could','should','may','might','must','can','its',
  'this','that','these','those','as','it','not','no','new',
  'says','said','after','before','about','into','up','out',
  'more','over','under','between','through','across','among',
  // コイン名（ランキングを偏らせないよう除外）
  'bitcoin','ethereum','crypto','cryptocurrency','blockchain',
  'btc','eth','xrp','sol','ada','bnb','doge','trx','dot','avax',
  'usdt','usdc','link','uni','ltc','near','matic','shib','wbtc',
  // 一般的すぎる動詞・名詞
  'get','use','make','take','give','go','come','know','see','want',
  'look','can','just','like','time','year','way','day','man','long',
  'first','even','back','still','work','life','many','last','great',
  'also','where','much','high','low','now','old','per','two','one','all',
]);

const CATEGORY_MAP = {
  etf:          'ETF',
  sec:          '規制',
  regulation:   '規制',
  regulatory:   '規制',
  approval:     'ETF',
  approved:     'ETF',
  reject:       '規制',
  hack:         'セキュリティ',
  hacked:       'セキュリティ',
  exploit:      'セキュリティ',
  vulnerability:'セキュリティ',
  security:     'セキュリティ',
  breach:       'セキュリティ',
  airdrop:      'エアドロップ',
  defi:         'DeFi',
  nft:          'NFT',
  layer2:       'Layer2',
  staking:      'ステーキング',
  stake:        'ステーキング',
  staked:       'ステーキング',
  halving:      '半減期',
  halvening:    '半減期',
  bull:         '相場',
  bear:         '相場',
  rally:        '相場',
  dump:         '相場',
  pump:         '相場',
  crash:        '相場',
  ath:          '価格',
  price:        '価格',
  listing:      '上場/廃止',
  delisting:    '上場/廃止',
  partnership:  '提携',
  institutional:'機関投資家',
  whale:        '相場',
  market:       '相場',
  exchange:     '取引所',
};

function extractTrendWords(news) {
  const now   = Date.now();
  const h48   = 48 * 60 * 60 * 1000;
  let recent  = news.filter(n => now - new Date(n.published_at).getTime() < h48);

  // 直近48hが少ない場合は直近100件にフォールバック
  if (recent.length < 20) recent = news.slice(0, 100);

  const wordCount = {};
  for (const n of recent) {
    const text  = (n.title ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = text.split(/\s+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
    for (const w of words) {
      wordCount[w] = (wordCount[w] ?? 0) + 1;
    }
  }

  return Object.entries(wordCount)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({
      word:     word.toUpperCase(),
      count,
      category: CATEGORY_MAP[word] ?? null,
    }));
}

// =====================================================================
// メイン処理
// =====================================================================
async function main() {
  console.log('Chain News Japan - ソーシャルデータ収集開始');
  const startTime = Date.now();

  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });

  // ニュースデータ読み込み
  let news = [];
  try {
    const raw = await readFile(NEWS_FILE, 'utf-8');
    news = JSON.parse(raw);
    console.log(`ニュースデータ読み込み: ${news.length}件`);
  } catch {
    console.warn('[WARN] data/news.json が見つかりません。空で続行します。');
  }

  const previousSnapshot = await loadPreviousSocialSnapshot();

  // ニュース件数集計
  const newsCounts = buildNewsCounts(news);

  // Reddit データ収集
  console.log(`\nReddit データ収集 (${COINS.length}コイン, site-wide)...`);
  const redditData    = {};
  let redditSuccess   = 0;
  let redditFailed    = 0;
  let redditJsonSuccess = 0;
  let redditRssSuccess = 0;
  let redditReusedPrevious = 0;

  for (let i = 0; i < COINS.length; i++) {
    const coin = COINS[i];
    if (i > 0) await delay(REQUEST_DELAY_MS);

    const result = await fetchRedditData(coin);
    if (result !== null) {
      redditData[coin.id] = result;
      redditSuccess++;
      if (result.source === 'json') redditJsonSuccess++;
      if (result.source === 'rss') redditRssSuccess++;
      process.stdout.write(`  ✓ ${coin.symbol.padEnd(5)}: posts=${String(result.post_count).padStart(3)}, engagement=${String(result.engagement).padStart(6)} [${result.source}]\n`);
    } else {
      const previous = getReusablePreviousSnapshot(previousSnapshot, coin.id);
      if (previous) {
        redditData[coin.id] = {
          post_count: previous.reddit_posts_24h,
          engagement: previous.reddit_engagement_24h,
          source: 'cached',
        };
        redditSuccess++;
        redditReusedPrevious++;
        process.stdout.write(`  ✓ ${coin.symbol.padEnd(5)}: posts=${String(previous.reddit_posts_24h).padStart(3)}, engagement=${String(previous.reddit_engagement_24h).padStart(6)} [cached]\n`);
      } else {
        redditData[coin.id] = { post_count: 0, engagement: 0, source: 'none' };
        redditFailed++;
      }
    }
  }

  // コイン別ソーシャル指標を計算
  const coinSocialData = COINS.map(coin => {
    const reddit     = redditData[coin.id] ?? { post_count: 0, engagement: 0 };
    const news_count = newsCounts[coin.id]?.news_24h ?? 0;

    // Hype Score = Reddit エンゲージメント ÷ ニュース数
    // 例: engagement=5000, news=3 → Hype=1666（SNS過熱）
    const hype_score = reddit.engagement > 0
      ? Math.round(reddit.engagement / Math.max(news_count, 1))
      : 0;

    return {
      coin_id:               coin.id,
      symbol:                coin.symbol,
      reddit_posts_24h:      reddit.post_count,
      reddit_engagement_24h: reddit.engagement,
      news_count_24h:        news_count,
      hype_score,
      buzz_rank:             0,   // 後で付与
    };
  });

  // buzz_rank = reddit_engagement_24h + news_count_24h×50 の複合スコアでランク付け
  const sorted = [...coinSocialData].sort((a, b) => {
    const sa = a.reddit_engagement_24h + a.news_count_24h * 50;
    const sb = b.reddit_engagement_24h + b.news_count_24h * 50;
    return sb - sa;
  });
  sorted.forEach((c, i) => { c.buzz_rank = i + 1; });

  // トレンドワード抽出
  const trendWords = extractTrendWords(news);
  console.log(`\nトレンドワード: ${trendWords.slice(0, 8).map(w => w.word).join(', ')} ...`);

  // 保存
  const snapshot = {
    updated_at:     new Date().toISOString(),
    reddit_enabled: redditSuccess > 0,
    coins:          coinSocialData,
    trend_words:    trendWords,
    stats: {
      reddit_success: redditSuccess,
      reddit_failed:  redditFailed,
      news_analyzed:  news.length,
      reddit_json_success: redditJsonSuccess,
      reddit_rss_success: redditRssSuccess,
      reddit_reused_previous: redditReusedPrevious,
      reddit_mode:
        redditJsonSuccess > 0 && (redditRssSuccess > 0 || redditReusedPrevious > 0) ? 'mixed' :
        redditJsonSuccess > 0 ? 'json' :
        redditRssSuccess > 0 ? 'rss' :
        redditReusedPrevious > 0 ? 'cached' :
        'unavailable',
    },
  };

  await writeFile(SOCIAL_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');

  console.log(`\n完了: ${formatElapsed(Date.now() - startTime)}`);
  console.log(`Reddit: ${redditSuccess}/${COINS.length}件成功, ${redditFailed}件失敗`);
  console.log(`保存先: ${SOCIAL_FILE}`);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
