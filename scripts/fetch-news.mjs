/**
 * ニュース自動収集スクリプト (v2)
 * 実行: node scripts/fetch-news.mjs
 *
 * 機能:
 *  - config/sources.json の全ソース（最大30件）から並列取得
 *  - URLハッシュ + タイトル類似度による重複排除
 *  - 差分取得: 前回取得時刻以降を優先
 *  - 上限 2000件 / 保持期間 30日
 *  - ソース単位の失敗は全体に影響しない
 *  - 取得統計を最後にまとめてログ出力
 */

import { createHash } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ========== 設定 ==========

const DATA_DIR     = join(ROOT, 'data');
const NEWS_FILE    = join(DATA_DIR, 'news.json');
const META_FILE    = join(DATA_DIR, 'fetch-meta.json');
const SOURCES_FILE = join(ROOT, 'config', 'sources.json');

const MAX_NEWS_TOTAL       = 2000;   // 最大保持件数
const MAX_AGE_DAYS         = 30;     // 30日より古い記事は削除
const FETCH_TIMEOUT        = 12000;  // ソースごとのタイムアウト(ms)
const TITLE_SIM_THRESHOLD  = 0.85;   // タイトル類似度の重複判定閾値

// ========== ソース読み込み ==========

async function loadSources() {
  try {
    const raw = await readFile(SOURCES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    console.error('[FATAL] config/sources.json が読み込めません');
    process.exit(1);
  }
}

// ========== ユーティリティ ==========

function generateId(title, url) {
  return createHash('md5').update(String(title) + '||' + String(url)).digest('hex').slice(0, 16);
}

/** タイトルの類似度計算(Jaccard係数 単語レベル) */
function titleSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let inter = 0;
  for (const w of wordsA) if (wordsB.has(w)) inter++;
  return inter / (wordsA.size + wordsB.size - inter);
}

function inferCategory(title, tags, hint) {
  if (hint) return hint;
  const t = (title + ' ' + (tags || []).join(' ')).toLowerCase();
  if (/etf|exchange.traded/i.test(t))                                  return 'ETF';
  if (/hack|exploit|breach|vulnerab|stolen|drain|rug.?pull/i.test(t)) return 'security';
  if (/regulat|sec |cftc|規制|ban|禁止|法案|当局|mica|fsb/i.test(t))   return 'regulation';
  if (/list|delist|上場|廃止|listed on/i.test(t))                      return 'listing';
  if (/upgrade|update|fork|mainnet|アップデート|ハードフォーク/i.test(t)) return 'upgrade';
  if (/partner|integrat|partnership/i.test(t))                          return 'partnership';
  if (/fed |interest rate|inflation|macro|cpi|gdp|treasury/i.test(t)) return 'macro';
  if (/airdrop|エアドロップ/i.test(t))                                   return 'airdrop';
  if (/defi|yield|liquidity|swap|amm|dex|staking/i.test(t))            return 'defi';
  if (/nft|opensea|non.fungible/i.test(t))                              return 'nft';
  if (/layer.?2|l2|rollup|optimism|arbitrum|polygon/i.test(t))         return 'layer2';
  return 'general';
}

const COIN_KEYWORDS = {
  bitcoin:              ['bitcoin', 'btc', 'ビットコイン'],
  ethereum:             ['ethereum', 'eth', 'イーサリアム', 'ether'],
  ripple:               ['ripple', 'xrp', 'リップル'],
  solana:               ['solana', 'sol', 'ソラナ'],
  dogecoin:             ['dogecoin', 'doge', 'ドージ'],
  cardano:              ['cardano', 'ada', 'カルダノ'],
  'avalanche-2':        ['avalanche', 'avax', 'アバランチ'],
  'shiba-inu':          ['shiba', 'shib', 'シバイヌ'],
  polkadot:             ['polkadot', 'dot', 'ポルカドット'],
  chainlink:            ['chainlink', 'link', 'チェーンリンク'],
  uniswap:              ['uniswap', 'uni', 'ユニスワップ'],
  litecoin:             ['litecoin', 'ltc', 'ライトコイン'],
  near:                 ['near protocol', 'near'],
  'matic-network':      ['polygon', 'matic', 'ポリゴン'],
  binancecoin:          ['binance', 'bnb'],
  tron:                 ['tron', 'trx', 'トロン'],
  'sui':                ['sui network', ' sui '],
  'aptos':              ['aptos', 'apt'],
  'injective-protocol': ['injective', 'inj'],
  'sei-network':        ['sei network', ' sei '],
};

function extractCoinIds(title) {
  const lower = title.toLowerCase();
  const found = [];
  for (const [coinId, keywords] of Object.entries(COIN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) found.push(coinId);
  }
  return found.length > 0 ? [...new Set(found)] : ['general'];
}

function calcImportance(trustScore, category) {
  const weights = {
    security: 1.0, ETF: 0.95, regulation: 0.9, listing: 0.75,
    upgrade: 0.7, partnership: 0.65, macro: 0.6, airdrop: 0.5,
    defi: 0.55, nft: 0.45, layer2: 0.55, general: 0.4,
  };
  return Math.min(1.0, trustScore * (weights[category] ?? 0.4) + 0.1);
}

// ========== XML パーサー ==========

function extractTag(xml, tag) {
  const m = xml.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
  return m ? stripCDATA(m[1]).trim() : null;
}

function extractLink(item, isAtom) {
  if (isAtom) {
    const m = item.match(/<link[^>]+href="([^"]+)"/i);
    return m ? m[1].trim() : null;
  }
  const m = item.match(/<link>([\s\S]*?)<\/link>/i);
  return m ? stripCDATA(m[1]).trim() : null;
}

function stripCDATA(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, '')
    .trim();
}

function parseRSSXML(xml, source) {
  const items = [];
  const now = new Date().toISOString();

  const isAtom = xml.includes('<entry>') || xml.includes('<entry ');
  const itemTag = isAtom ? 'entry' : 'item';
  const re = new RegExp('<' + itemTag + '[\\s>]([\\s\\S]*?)<\\/' + itemTag + '>', 'g');
  const itemMatches = xml.matchAll(re);

  for (const match of itemMatches) {
    const item = match[1];

    const title   = extractTag(item, 'title') ?? '';
    const link    = extractLink(item, isAtom);
    const pubDate = extractTag(item, 'pubDate')
      || extractTag(item, 'published')
      || extractTag(item, 'updated')
      || '';

    const rawTags = [...item.matchAll(/<category[^>]*>([^<]*)<\/category>/gi)].map(m => m[1]);

    if (!title || !link) continue;
    if (!/^https?:\/\//i.test(link)) continue;

    const cleanTitle = stripCDATA(title).trim();
    const cleanLink  = stripCDATA(link).trim();
    if (!cleanTitle || cleanTitle.length < 5) continue;

    const category   = inferCategory(cleanTitle, rawTags, source.category_hint ?? null);
    const coin_ids   = extractCoinIds(cleanTitle);
    const importance = calcImportance(source.trust_score, category);

    let publishedAt;
    try {
      const d = pubDate ? new Date(stripCDATA(pubDate)) : new Date();
      publishedAt = isNaN(d.getTime()) ? now : d.toISOString();
    } catch {
      publishedAt = now;
    }

    items.push({
      id:               generateId(cleanTitle, cleanLink),
      title:            cleanTitle,
      source_name:      source.name,
      source_url:       source.url,
      article_url:      cleanLink,
      published_at:     publishedAt,
      fetched_at:       now,
      language:         source.language,
      summary_ja:       null,
      importance_score: Math.round(importance * 100) / 100,
      sentiment_score:  0,
      category,
      tags:             rawTags.map(t => stripCDATA(t).toLowerCase()).filter(Boolean),
      coin_ids,
    });
  }
  return items;
}

// ========== RSS フェッチ ==========

async function fetchSource(source) {
  const start = Date.now();
  try {
    const res = await fetch(source.url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: {
        'User-Agent': 'ChainNewsJapan/2.0 (+https://example.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      },
    });
    if (!res.ok) {
      console.warn('  [SKIP] ' + source.name + ': HTTP ' + res.status);
      return { source: source.name, items: [], error: 'HTTP ' + res.status, ms: Date.now() - start };
    }
    const xml = await res.text();
    const items = parseRSSXML(xml, source);
    console.log('  [OK]   ' + source.name + ': ' + items.length + '件 (' + (Date.now() - start) + 'ms)');
    return { source: source.name, items, error: null, ms: Date.now() - start };
  } catch (err) {
    const msg = err.name === 'TimeoutError' ? 'タイムアウト' : err.message;
    console.warn('  [FAIL] ' + source.name + ': ' + msg);
    return { source: source.name, items: [], error: msg, ms: Date.now() - start };
  }
}

// ========== 重複チェック ==========

function buildDedupIndex(existing) {
  const idSet    = new Set(existing.map(n => n.id));
  const urlSet   = new Set(existing.map(n => n.article_url));
  const titleMap = existing.map(n => ({ title: n.title, lang: n.language }));
  return { idSet, urlSet, titleMap };
}

function isDuplicate(item, index) {
  if (index.idSet.has(item.id))           return true;
  if (index.urlSet.has(item.article_url)) return true;
  for (const ex of index.titleMap.slice(-500)) {
    if (ex.lang !== item.language) continue;
    if (titleSimilarity(item.title, ex.title) >= TITLE_SIM_THRESHOLD) return true;
  }
  return false;
}

// ========== メタデータ ==========

async function loadMeta() {
  try {
    const raw = await readFile(META_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { last_fetch: null, total_fetched: 0, source_stats: {} };
  }
}

// ========== メイン ==========

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(60));
  console.log('Chain News Japan - ニュース収集開始');
  console.log(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) + ' JST');
  console.log('='.repeat(60));

  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });

  let existing = [];
  try {
    const raw = await readFile(NEWS_FILE, 'utf-8');
    existing = JSON.parse(raw);
    console.log('既存ニュース: ' + existing.length + '件');
  } catch {
    console.log('既存ニュースなし（新規作成）');
  }

  const meta = await loadMeta();
  if (meta.last_fetch) {
    console.log('前回取得: ' + new Date(meta.last_fetch).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) + ' JST');
  }

  const sources = await loadSources();
  console.log('取得ソース数: ' + sources.length + '件\n');

  // 最大10並列でフェッチ
  const BATCH_SIZE = 10;
  const allResults = [];
  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(fetchSource));
    for (const r of results) {
      if (r.status === 'fulfilled') allResults.push(r.value);
    }
  }

  const successCount = allResults.filter(r => !r.error).length;
  const failCount    = allResults.filter(r =>  r.error).length;
  const totalFresh   = allResults.reduce((s, r) => s + r.items.length, 0);

  console.log('\nフェッチ結果: 成功 ' + successCount + '/' + sources.length + 'ソース, 取得 ' + totalFresh + '件');
  if (failCount > 0) {
    console.log('失敗ソース (' + failCount + '件):');
    allResults.filter(r => r.error).forEach(r => {
      console.log('  - ' + r.source + ': ' + r.error);
    });
  }

  const dedupIndex = buildDedupIndex(existing);
  const freshItems = allResults.flatMap(r => r.items);

  let addedCount = 0;
  let dupCount   = 0;
  const newItems = [];

  for (const item of freshItems) {
    if (isDuplicate(item, dedupIndex)) {
      dupCount++;
    } else {
      newItems.push(item);
      dedupIndex.idSet.add(item.id);
      dedupIndex.urlSet.add(item.article_url);
      dedupIndex.titleMap.push({ title: item.title, lang: item.language });
      addedCount++;
    }
  }
  console.log('新規追加: ' + addedCount + '件 (重複スキップ: ' + dupCount + '件)');

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const cleaned = existing.filter(n => new Date(n.published_at).getTime() > cutoff);
  const expiredCount = existing.length - cleaned.length;
  if (expiredCount > 0) {
    console.log('期限切れ削除: ' + expiredCount + '件 (' + MAX_AGE_DAYS + '日以上)');
  }

  const merged = [...newItems, ...cleaned]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, MAX_NEWS_TOTAL);

  await writeFile(NEWS_FILE, JSON.stringify(merged, null, 2), 'utf-8');

  const nowIso = new Date().toISOString();
  const sourceStats = {};
  for (const r of allResults) {
    sourceStats[r.source] = { count: r.items.length, error: r.error, ms: r.ms, updated_at: nowIso };
  }
  await writeFile(META_FILE, JSON.stringify({ last_fetch: nowIso, total_fetched: (meta.total_fetched ?? 0) + addedCount, source_stats: sourceStats }, null, 2), 'utf-8');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('='.repeat(60));
  console.log('完了: 保存 ' + merged.length + '件 -> data/news.json (' + elapsed + '秒)');
  if (merged.length >= 1500) console.log('目標1500件達成！');
  else if (merged.length < 300) console.log('件数が少ない(' + merged.length + '件)。ソースのURL/形式を確認してください。');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('致命的エラー:', err);
  process.exit(1);
});
