import { describe, it, expect } from 'vitest'
import { extractPlainText } from '../extractor.js'

const SAMPLE_MULTIPART = `MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="test-boundary-123"

--test-boundary-123
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit

利用金額：123円

--test-boundary-123
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

<html></html>

--test-boundary-123--`

describe('extractPlainText', () => {
  it('multipart/alternativeからtext/plainパートを抽出する', () => {
    const result = extractPlainText(SAMPLE_MULTIPART)
    expect(result).toContain('利用金額：123円')
  })

  it('HTMLパートの内容は含まれない', () => {
    const result = extractPlainText(SAMPLE_MULTIPART)
    expect(result).not.toContain('<html>')
  })

  it('text/plainパートがない場合はnullを返す', () => {
    const result = extractPlainText('Content-Type: text/html\n\n<html></html>')
    expect(result).toBeNull()
  })

  it('ISO-2022-JPエンコードのメールをデコードする', () => {
    // ISO-2022-JP で "円" は \x1b$B1_(B
    const isoContent = '\x1b$B1_(B'
    const email = `Content-Type: multipart/alternative; boundary="b"

--b
Content-Type: text/plain; charset="iso-2022-jp"
Content-Transfer-Encoding: 7bit

${isoContent}

--b--`
    const result = extractPlainText(email)
    expect(result).toContain('円')
  })
})
