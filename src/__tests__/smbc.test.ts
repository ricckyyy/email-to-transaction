import { describe, it, expect } from 'vitest'
import { parseEmail, SMBC_CARD_CONFIG } from '../index.js'

// 三井住友カードのメールのplain text部分（デコード後の内容をUTF-8でラップして테스트）
const SMBC_PLAIN_TEXT = `Olive会員　様

いつも三井住友カードをご利用いただきありがとうございます。
お客様のカードご利用内容をお知らせいたします。

ご利用カード：Olive/クレジット

～利用日：2026/06/19 08:46
～利用先：セブン－イレブン
～利用取引：買物
～利用金額：846円
`

const buildRawEmail = (from: string, body: string) => `From: ${from}
Content-Type: multipart/alternative; boundary="test-boundary"

--test-boundary
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit

${body}
--test-boundary--`

describe('parseEmail with SMBC_CARD_CONFIG', () => {
  it('三井住友カードの通知メールを解析できる', () => {
    const raw = buildRawEmail('statement@vpass.ne.jp', SMBC_PLAIN_TEXT)
    const result = parseEmail(raw, [SMBC_CARD_CONFIG])
    expect(result).not.toBeNull()
    expect(result!.amount).toBe(846)
    expect(result!.merchant).toBe('セブン－イレブン')
    expect(result!.cardName).toBe('三井住友カード')
    expect(result!.type).toBe('買物')
  })

  it('対応していない送信元のメールはnullを返す', () => {
    const raw = buildRawEmail('noreply@other-bank.co.jp', '利用金額：1000円')
    const result = parseEmail(raw, [SMBC_CARD_CONFIG])
    expect(result).toBeNull()
  })

  it('Fromヘッダーがない場合はnullを返す', () => {
    const result = parseEmail('Subject: test\n\nbody', [SMBC_CARD_CONFIG])
    expect(result).toBeNull()
  })
})
