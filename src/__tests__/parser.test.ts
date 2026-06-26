import { describe, it, expect } from 'vitest'
import { parseFields } from '../parser.js'
import type { CardConfig } from '../types.js'

const TEST_CONFIG: CardConfig = {
  name: 'テストカード',
  senderDomain: 'example.com',
  encoding: 'utf-8',
  timezoneOffset: 9,
  patterns: {
    date: /利用日時?[：:]\s*(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})/,
    merchant: /利用先[：:]\s*(.+)/,
    amount: /利用金額[：:]\s*([\d,]+)円/,
    type: /利用取引[：:]\s*(.+)/,
  },
}

const DECODED_TEXT = `
ご利用カード：テストカード

～利用日時：2026/06/19 08:46
～利用先：セブン－イレブン
～利用取引：買物
～利用金額：846円
`

describe('parseFields', () => {
  it('デコード済みテキストから各フィールドを抽出する', () => {
    const result = parseFields(DECODED_TEXT, TEST_CONFIG)
    expect(result).not.toBeNull()
    expect(result!.merchant).toBe('セブン－イレブン')
    expect(result!.amount).toBe(846)
    expect(result!.type).toBe('買物')
    expect(result!.cardName).toBe('テストカード')
  })

  it('日付をタイムゾーンオフセットに基づいてUTCへ変換する', () => {
    const result = parseFields(DECODED_TEXT, TEST_CONFIG)
    expect(result!.date).toEqual(new Date('2026-06-18T23:46:00.000Z'))
  })

  it('カンマ区切りの金額を正しく解析する', () => {
    const text = '利用金額：1,234円\n利用先：店舗\n利用日時：2026/01/01 10:00\n利用取引：買物'
    const result = parseFields(text, TEST_CONFIG)
    expect(result!.amount).toBe(1234)
  })

  it('必須フィールドが見つからない場合はnullを返す', () => {
    const result = parseFields('関係ないテキスト', TEST_CONFIG)
    expect(result).toBeNull()
  })
})
