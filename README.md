# Chain News Japan 🚀

> 暗号資産の "話題量" で市場の温度を読む

国内外のニュースを自動収集し、**どの通貨が今どれだけ話題になっているか**を日本語でリアルタイム可視化するWebサービスです。

## 特徴

- ⚡ **急上昇ランキング** — 24hで話題量が急増した通貨を倍率表示
- 🌡️ **話題量ヒートマップ** — 全通貨の注目度を色で直感的に把握
- 📊 **価格×話題量マトリクス** — 「価格未反映の注目通貨」を発見
- 📰 **自動ニュース収集** — CoinDesk, CoinPost 等から30分ごとに取得
- 🇯🇵 **日本語UI** — すべて日本語・日本時間表示

## デモ画面構成

| ページ | 説明 |
|--------|------|
| `/` | トップ: 注目通貨・急上昇ランキング・マトリクス |
| `/ranking` | 各種ランキング一覧 |
| `/news` | ニュース一覧（カテゴリ/重要度フィルタ） |
| `/coins/[slug]` | 通貨詳細（話題量推移・関連ニュース） |
| `/heatmap` | ヒートマップ + マトリクス |

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | Next.js 14 (App Router) |
| スタイリング | Tailwind CSS |
| チャート | Recharts |
| データ保存 | JSON (→ Supabase に移行可) |
| ニュース取得 | RSS / GitHub Actions |
| 価格データ | CoinGecko Free API |
| デプロイ | Vercel (無料) |
| 自動更新 | GitHub Actions (無料枠) |

## セットアップ

```bash
# 依存関係インストール
npm install

# 初回データ取得
node scripts/update-prices.mjs
node scripts/fetch-news.mjs

# 開発サーバー起動
npm run dev
```

http://localhost:3000 で確認できます。

## デプロイ（Vercel）

```bash
# Vercel CLI でデプロイ
npm i -g vercel
vercel
```

### GitHub Actions での自動更新

1. リポジトリを GitHub に push
2. `.github/workflows/fetch-news.yml` — 30分ごとにニュース取得
3. `.github/workflows/update-prices.yml` — 15分ごとに価格更新
4. Vercel の再デプロイをトリガー: `VERCEL_DEPLOY_HOOK` Secretに設定

## 月額コスト目安

| サービス | 費用 |
|----------|------|
| Vercel (フロント) | 無料 |
| GitHub Actions | 無料枠内 |
| CoinGecko API | 無料枠 |
| ドメイン | 約100〜250円/月 |
| **合計** | **〜300円/月** |

## 免責事項

本サービスは投資助言を目的としません。情報の正確性を保証しません。
暗号資産への投資判断はご自身の責任で行ってください。

---

## カスタマイズ

### 通貨を追加する

[src/lib/coins.ts](src/lib/coins.ts) の `COIN_MASTER` に追加し、`COIN_KEYWORDS` にキーワードを定義します。

### ニュースソースを追加する

[scripts/fetch-news.mjs](scripts/fetch-news.mjs) の `RSS_SOURCES` 配列にRSSフィードURLを追加します。

### AI要約を追加する（Phase 2）

`scripts/summarize.mjs` を作成し、OpenAI API等で `summary_ja` フィールドを埋めます。
コスト抑制のため重要度スコア 0.7 以上の記事のみを対象にします。

## X 手動投稿フロー

X API を使わず、投稿文だけを生成して手動で貼る運用ができます。

```bash
npm run generate-x-posts
```

実行すると [data/x-posts.md](data/x-posts.md) に朝・昼・夜の3本分の下書きが出力されます。

- 朝: 直近24時間の注目通貨
- 昼: 強いテーマと注目通貨
- 夜: Hypeスコア上位のまとめ

まずはこの下書きをそのまま X に貼り、反応が取れた投稿パターンを後で自動化するのが安全です。

### 下書きの自動更新

[.github/workflows/generate-x-posts.yml](.github/workflows/generate-x-posts.yml) で朝・昼・夜の3回、[data/x-posts.md](data/x-posts.md) を自動更新できます。

- 朝 08:35 JST
- 昼 12:35 JST
- 夜 20:35 JST

X API は使わず、GitHub Actions が下書きだけを更新します。投稿自体は手動で行います。
