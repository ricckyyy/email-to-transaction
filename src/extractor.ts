function decodeBody(text: string, encoding: string): string {
  const normalized = encoding.toLowerCase().replace(/[-_]/g, '')
  if (normalized === 'utf8' || normalized === 'usascii' || normalized === 'ascii') {
    return text
  }
  const buf = Buffer.from(text, 'binary')
  return new TextDecoder(encoding).decode(buf).replace(/�/g, '')
}

export function extractPlainText(rawEmail: string): string | null {
  const boundaryMatch = rawEmail.match(/boundary="([^"]+)"/i)

  if (!boundaryMatch) {
    const simpleMatch = rawEmail.match(
      /Content-Type:\s*text\/plain[^\n]*charset="([^"]+)"[\s\S]*?\r?\n\r?\n([\s\S]+)$/i
    )
    if (!simpleMatch) return null
    return decodeBody(simpleMatch[2].trim(), simpleMatch[1])
  }

  const boundary = boundaryMatch[1]
  const parts = rawEmail.split('--' + boundary)

  for (const part of parts) {
    const ctMatch = part.match(/Content-Type:\s*text\/plain[^\n]*charset="([^"]+)"/i)
    if (!ctMatch) continue

    const encoding = ctMatch[1]
    const bodyMatch = part.match(/\r?\n\r?\n([\s\S]+)$/)
    if (!bodyMatch) continue

    return decodeBody(bodyMatch[1].trim(), encoding)
  }

  return null
}
