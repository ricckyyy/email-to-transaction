# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build       # TypeScript compile → dist/
npm test            # Run all tests (vitest run)
npm run test:watch  # Watch mode
```

To run a single test file:
```bash
npx vitest run src/__tests__/smbc.test.ts
```

## Architecture

This is a zero-dependency TypeScript library that converts raw credit card notification emails into structured `ParsedTransaction` objects.

### Processing pipeline

```
rawEmail (string)
  → parseEmail()          # src/index.ts  – entry point
      → extractPlainText()  # src/extractor.ts – MIME parsing + charset decoding
      → parseFields()       # src/parser.ts    – regex extraction via CardConfig
  → ParsedTransaction | null
```

**`src/index.ts`** – Reads the `From:` header, matches sender domain against the supplied `CardConfig[]`, then pipes the email through `extractPlainText` → `parseFields`.

**`src/extractor.ts`** – Handles both simple and `multipart/alternative` MIME emails. Locates the `text/plain` part and decodes it (supports `iso-2022-jp` via `TextDecoder`).

**`src/parser.ts`** – Applies four regexes from `CardConfig.patterns` to the decoded text. Parses JST dates by subtracting 9 hours to produce UTC `Date` objects.

**`src/types.ts`** – Defines `CardConfig` and `ParsedTransaction`.

**`src/configs/smbc.ts`** – The only built-in `CardConfig` (三井住友カード, sender domain `vpass.ne.jp`, `iso-2022-jp` encoding).

### Adding a new card

Define a `CardConfig` with `name`, `senderDomain`, `encoding`, and four regex `patterns` (each with one capture group). Export it from `src/configs/` and re-export from `src/index.ts`.

### Build output

`tsc` compiles to `dist/` (excluded from source compilation). Tests import from `../extractor.js` etc. using NodeNext module resolution, so `.js` extensions are required in import paths even for `.ts` source files.
