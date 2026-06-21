# email-to-transaction

クレジットカードの利用通知メールを解析して取引データに変換するライブラリ。

## インストール

```bash
npm install github:ricckyyy/email-to-transaction
```

## 使い方

```typescript
import { parseEmail, SMBC_CARD_CONFIG } from 'email-to-transaction'

const result = parseEmail(rawEmailText, [SMBC_CARD_CONFIG])
// → { date: Date, merchant: string, amount: number, type: string, cardName: string }
// → null（対応カードのメールでない場合）
```

## 対応カード

- 三井住友カード（`SMBC_CARD_CONFIG`）

## 他のカードに対応する方法

`CardConfig` を定義して `parseEmail` に渡すだけです。

```typescript
import { parseEmail } from 'email-to-transaction'
import type { CardConfig } from 'email-to-transaction'

const MY_CARD_CONFIG: CardConfig = {
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

const result = parseEmail(rawEmailText, [MY_CARD_CONFIG])
```

## Gmail連携のセットアップ（kakeiboアプリ等で使う場合）

Gmailからメールを取得してこのライブラリで解析するには、Gmail APIのOAuth認証が必要です。

### 1. Google Cloud ConsoleでOAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「ライブラリ」→「Gmail API」を有効化
3. 「APIとサービス」→「OAuth同意画面」→「外部」で作成
   - アプリ名・メールアドレスを入力
   - 「対象」→「テストユーザー」に自分のGmailアドレスを追加
4. 「APIとサービス」→「認証情報」→「+認証情報を作成」→「OAuth 2.0 クライアントID」
   - 種類: **デスクトップ アプリ**
   - クライアントIDとシークレットをメモ

### 2. refresh_tokenの取得

アプリのルートにある `scripts/gmail-auth.mjs` を実行します（初回のみ）：

```bash
GMAIL_CLIENT_ID=your-client-id \
GMAIL_CLIENT_SECRET=your-client-secret \
node scripts/gmail-auth.mjs
```

表示されたURLをブラウザで開き、Gmailアカウントで認証します。  
別のGmailアカウントのメールを取得したい場合は、そのアカウントでログインしてください。

表示されたコードをターミナルに貼り付けると `GMAIL_REFRESH_TOKEN` が出力されます。

### 3. 環境変数の設定

`.env.local` に追記：

```
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=取得したトークン
GMAIL_SENDER_EMAIL=statement@vpass.ne.jp
```

`GMAIL_SENDER_EMAIL` は取得対象の送信元アドレスです。カード会社によって異なります。

| カード | 送信元アドレス |
|--------|--------------|
| 三井住友カード | `statement@vpass.ne.jp` |
