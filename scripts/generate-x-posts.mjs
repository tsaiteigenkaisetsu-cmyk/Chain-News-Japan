import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const OUTPUT_FILE = join(DATA_DIR, 'x-posts.md');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chain-news-japan-webappjp.vercel.app';

function formatCompactNumber(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  return `${value}`;
}

function formatJst(isoString) {
  if (!isoString) return '不明';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '不明';

  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

async function loadJson(path) {
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw);
}

function sortBuzz(coins) {
  return [...coins]
    .filter(coin => coin.news_count_24h > 0 || coin.reddit_engagement_24h > 0 || coin.reddit_posts_24h > 0)
    .sort((left, right) => left.buzz_rank - right.buzz_rank);
}

function sortHype(coins) {
  return [...coins]
    .filter(coin => coin.hype_score > 0)
    .sort((left, right) => right.hype_score - left.hype_score);
}

function buildBuzzSummary(coin) {
  return `${coin.symbol} ニュース${coin.news_count_24h}件 / SNS${formatCompactNumber(coin.reddit_engagement_24h)}`;
}

function buildMetricSummary(coin) {
  return `ニュース${coin.news_count_24h}件 / SNS${formatCompactNumber(coin.reddit_engagement_24h)}`;
}

function buildMorningPost(topBuzz, newsCount) {
  const lines = topBuzz.slice(0, 3).map((coin, index) => {
    return `${index + 1}位 ${buildBuzzSummary(coin)}`;
  });

  return [
    '【朝の注目通貨】',
    '直近24時間で特に注目が集まっている通貨をまとめました。',
    ...lines,
    '',
    `総収集件数は ${newsCount}件。サイトは10分ごとに更新しています。`,
    '市場の温度感をざっと確認したいときにどうぞ。',
    SITE_URL,
    '#仮想通貨 #暗号資産',
  ].join('\n');
}

function buildNoonPost(topThemes, topBuzz) {
  const themeText = topThemes.slice(0, 3).map(theme => theme.word).join(' / ');
  const strongestCoin = topBuzz[0];
  const coinText = topBuzz.slice(0, 3).map(coin => coin.symbol).join(' / ');

  return [
    '【昼の市場テーマ】',
    `いま強いテーマは ${themeText}。`,
    `注目通貨は ${coinText}。`,
    '',
    strongestCoin
      ? `現時点では ${strongestCoin.symbol} が先頭で、${buildMetricSummary(strongestCoin)}です。`
      : '国内外ニュースとSNS話題量を横断して追っています。',
    SITE_URL,
    '#仮想通貨ニュース',
  ].join('\n');
}

function buildEveningPost(topHype, socialMode) {
  const lines = topHype.slice(0, 3).map((coin, index) => {
    return `${index + 1}位 ${coin.symbol} Hype ${coin.hype_score} / ニュース${coin.news_count_24h}件`;
  });

  const socialNote = socialMode === 'json'
    ? 'SNS反応量も反映した集計です。'
    : 'SNS反応量は一部フォールバックを含む集計です。';

  return [
    '【夜のまとめ】',
    'きょう伸びた通貨を Hype スコア順で振り返ります。',
    ...lines,
    '',
    socialNote,
    '明日の動きを見る前のチェック用に。',
    SITE_URL,
    '#ビットコイン #アルトコイン',
  ].join('\n');
}

function countChars(text) {
  return [...text].length;
}

async function main() {
  const social = await loadJson(join(DATA_DIR, 'social.json'));
  const news = await loadJson(join(DATA_DIR, 'news.json'));

  const topBuzz = sortBuzz(social.coins);
  const topHype = sortHype(social.coins);
  const topThemes = social.trend_words ?? [];

  const morningPost = buildMorningPost(topBuzz, news.length);
  const noonPost = buildNoonPost(topThemes, topBuzz);
  const eveningPost = buildEveningPost(topHype, social.stats?.reddit_mode ?? 'unavailable');

  const output = [
    '# X 投稿下書き',
    '',
    `- 生成時刻: ${formatJst(new Date().toISOString())} JST`,
    `- ソーシャル更新: ${formatJst(social.updated_at)} JST`,
    `- 総ニュース件数: ${news.length}件`,
    `- Reddit モード: ${social.stats?.reddit_mode ?? 'unavailable'}`,
    '',
    '## 朝',
    '',
    `文字数目安: ${countChars(morningPost)}`,
    '',
    '```text',
    morningPost,
    '```',
    '',
    '## 昼',
    '',
    `文字数目安: ${countChars(noonPost)}`,
    '',
    '```text',
    noonPost,
    '```',
    '',
    '## 夜',
    '',
    `文字数目安: ${countChars(eveningPost)}`,
    '',
    '```text',
    eveningPost,
    '```',
    '',
  ].join('\n');

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, output, 'utf-8');

  console.log(`X投稿下書きを生成しました: ${OUTPUT_FILE}`);
  console.log('朝');
  console.log(morningPost);
  console.log('');
  console.log('昼');
  console.log(noonPost);
  console.log('');
  console.log('夜');
  console.log(eveningPost);
}

main().catch(error => {
  console.error('X投稿下書きの生成に失敗しました。');
  console.error(error);
  process.exitCode = 1;
});