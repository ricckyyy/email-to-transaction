import type { CardConfig, ParsedTransaction } from './types.js';
export { SMBC_CARD_CONFIG } from './configs/smbc.js';
export type { CardConfig, ParsedTransaction } from './types.js';
export declare function parseEmail(rawEmail: string, configs: CardConfig[]): ParsedTransaction | null;
