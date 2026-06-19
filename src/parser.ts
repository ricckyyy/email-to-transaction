import type { CardConfig, ParsedTransaction } from './types.js'

export function parseFields(text: string, config: CardConfig): ParsedTransaction | null {
  const dateMatch = text.match(config.patterns.date)
  const merchantMatch = text.match(config.patterns.merchant)
  const amountMatch = text.match(config.patterns.amount)
  const typeMatch = text.match(config.patterns.type)

  if (!dateMatch || !merchantMatch || !amountMatch) return null

  const dateStr = dateMatch[1].trim()
  const [datePart, timePart = '00:00'] = dateStr.split(/\s+/)
  const [year, month, day] = datePart.split('/').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  // JSTはUTC+9なので9時間引く
  const date = new Date(Date.UTC(year, month - 1, day, hour - 9, minute))

  const amount = Number(amountMatch[1].replace(/,/g, ''))

  return {
    date,
    merchant: merchantMatch[1].trim(),
    amount,
    type: typeMatch ? typeMatch[1].trim() : '',
    cardName: config.name,
  }
}
