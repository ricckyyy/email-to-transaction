export type ParsedTransaction = {
  date: Date
  merchant: string
  amount: number
  type: string
  cardName: string
}

export type CardConfig = {
  name: string
  senderDomain: string
  encoding: string
  patterns: {
    date: RegExp
    merchant: RegExp
    amount: RegExp
    type: RegExp
  }
}
