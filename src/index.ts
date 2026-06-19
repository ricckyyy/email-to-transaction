import { extractPlainText } from './extractor.js'
import { parseFields } from './parser.js'
import type { CardConfig, ParsedTransaction } from './types.js'

export { SMBC_CARD_CONFIG } from './configs/smbc.js'
export type { CardConfig, ParsedTransaction } from './types.js'

export function parseEmail(
  rawEmail: string,
  configs: CardConfig[]
): ParsedTransaction | null {
  const fromMatch = rawEmail.match(/^From:.*@([\w.-]+)/im)
  if (!fromMatch) return null
  const senderDomain = fromMatch[1].toLowerCase()

  const config = configs.find((c) =>
    senderDomain.endsWith(c.senderDomain.toLowerCase())
  )
  if (!config) return null

  const text = extractPlainText(rawEmail)
  if (!text) return null

  return parseFields(text, config)
}
