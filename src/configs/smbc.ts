import type { CardConfig } from '../types.js'

export const SMBC_CARD_CONFIG: CardConfig = {
  name: '三井住友カード',
  senderDomain: 'vpass.ne.jp',
  encoding: 'iso-2022-jp',
  timezoneOffset: 9,
  patterns: {
    date: /利用日時?[：:]\s*(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})/,
    merchant: /利用先[：:]\s*(.+)/,
    amount: /利用金額[：:]\s*([\d,]+)円/,
    type: /利用取引[：:]\s*(.+)/,
  },
}
