# email-to-transaction

クレジットカードの利用通知メールを解析して、構造化された取引データに変換するゼロ依存の TypeScript ライブラリです。

## 機能

- **マルチカード対応**: `CardConfig` を定義するだけで任意のカード会社に対応可能
- **MIME 解析**: `multipart/alternative` 形式および単純な `text/plain` メールに対応
- **文字コード変換**: `ISO-2022-JP`（JIS）・`UTF-8` などのエンコーディングを自動デコード
- **JST 日付処理**: メール本文の日本時間（JST）を UTC の `Date` オブジェクトとして返す
- **ゼロ依存**: Node.js 標準 API のみを使用（`TextDecoder`・`Buffer`）

## 対応カード

| カード会社 | エクスポート名 | 送信元ドメイン |
|-----------|--------------|--------------|
| 三井住友カード | `SMBC_CARD_CONFIG` | `vpass.ne.jp` |

## インストール

```bash
npm install github:ricckyyy/email-to-transaction
```

## 使い方

```typescript
import { parseEmail, SMBC_CARD_CONFIG } from 'email-to-transaction'

const result = parseEmail(rawEmailText, [SMBC_CARD_CONFIG])

if (result) {
  console.log(result.date)      // Date（UTC）
  console.log(result.merchant)  // "セブン－イレブン"
  console.log(result.amount)    // 846
  console.log(result.type)      // "買物"
  console.log(result.cardName)  // "三井住友カード"
}
// 対応カードのメールでない場合は null
```

## API

### `parseEmail(rawEmail, configs)`

生のメールテキスト（RFC 2822 形式）を受け取り、`ParsedTransaction` または `null` を返します。

| 引数 | 型 | 説明 |
|-----|-----|------|
| `rawEmail` | `string` | `From:` ヘッダーを含む生のメールテキスト |
| `configs` | `CardConfig[]` | 照合するカード設定の配列 |

`From:` ヘッダーの送信元ドメインが `CardConfig.senderDomain` にマッチしない場合は `null` を返します。

### `ParsedTransaction`

```typescript
type ParsedTransaction = {
  date: Date        // 利用日時（UTC）
  merchant: string  // 利用先・店舗名
  amount: number    // 利用金額（整数・円）
  type: string      // 利用区分（例: "買物"）
  cardName: string  // カード名（CardConfig.name）
}
```

### `CardConfig`

```typescript
type CardConfig = {
  name: string          // カード名（ParsedTransaction.cardName に使用）
  senderDomain: string  // 送信元ドメイン（例: "vpass.ne.jp"）
  encoding: string      // メール本文の文字コード（例: "iso-2022-jp"）
  patterns: {
    date: RegExp      // キャプチャグループ1: "YYYY/MM/DD HH:mm" 形式
    merchant: RegExp  // キャプチャグループ1: 店舗名
    amount: RegExp    // キャプチャグループ1: カンマ区切り数値（"円"除く）
    type: RegExp      // キャプチャグループ1: 利用区分（任意）
  }
}
```

## 独自カードの追加

`CardConfig` を定義して `parseEmail` に渡すだけです。

```typescript
import { parseEmail } from 'email-to-transaction'
import type { CardConfig } from 'email-to-transaction'

const RAKUTEN_CARD_CONFIG: CardConfig = {
  name: '楽天カード',
  senderDomain: 'ml.rakuten-card.co.jp',
  encoding: 'utf-8',
  patterns: {
    date: /ご利用日時[：:]\s*(\d{4}年\d{2}月\d{2}日\s+\d{2}:\d{2})/,
    merchant: /ご利用店名[：:]\s*(.+)/,
    amount: /ご利用金額[：:]\s*([\d,]+)円/,
    type: /ご利用区分[：:]\s*(.+)/,
  },
}

const result = parseEmail(rawEmailText, [RAKUTEN_CARD_CONFIG])
```

複数のカードを同時に渡すこともできます：

```typescript
const result = parseEmail(rawEmailText, [SMBC_CARD_CONFIG, RAKUTEN_CARD_CONFIG])
```

## Gmail 連携のセットアップ

Gmail からメールを取得してこのライブラリで解析するには、Gmail API の OAuth 認証が必要です。

### 1. Google Cloud Console で OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「ライブラリ」→「Gmail API」を有効化
3. 「APIとサービス」→「OAuth同意画面」→「外部」で作成
   - アプリ名・メールアドレスを入力
   - 「対象」→「テストユーザー」に自分の Gmail アドレスを追加
4. 「APIとサービス」→「認証情報」→「+認証情報を作成」→「OAuth 2.0 クライアントID」
   - 種類: **デスクトップ アプリ**
   - クライアント ID とシークレットをメモ

### 2. refresh_token の取得

`scripts/gmail-auth.mjs` を実行します（初回のみ）：

```bash
GMAIL_CLIENT_ID=your-client-id \
GMAIL_CLIENT_SECRET=your-client-secret \
node scripts/gmail-auth.mjs
```

表示された URL をブラウザで開き、Gmail アカウントで認証します。
コードをターミナルに貼り付けると `GMAIL_REFRESH_TOKEN` が出力されます。

### 3. 環境変数の設定

`.env.local` に追記：

```env
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=取得したトークン
GMAIL_SENDER_EMAIL=statement@vpass.ne.jp
```

`GMAIL_SENDER_EMAIL` は取得対象の送信元アドレスです。

| カード | 送信元アドレス |
|--------|--------------|
| 三井住友カード | `statement@vpass.ne.jp` |

## 開発

```bash
npm run build       # TypeScript コンパイル → dist/
npm test            # テスト実行
npm run test:watch  # ウォッチモード
```

## ライセンス

MIT
