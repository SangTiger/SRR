function extractShortcode(url: string): string | null {
  const m = url.match(/\/(p|reels?|tv)\/([A-Za-z0-9_-]+)/)
  return m ? m[2] : null
}

function getBrowserHeaders(): Record<string, string> {
  const sessionId = process.env.INSTAGRAM_SESSION_ID
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  }
  if (sessionId) {
    headers['Cookie'] = `sessionid=${sessionId}`
  }
  return headers
}

function extractFromHtml(html: string, shortcode: string): { like_count: number; comments_count: number } | null {
  // 모든 like_count 위치를 찾고, shortcode가 주변 5000자 이내에 있는 것 선택
  const likeRegex = /"like_count"\s*:\s*(\d+)/g
  const commentRegex = /"comment_count"\s*:\s*(\d+)/g

  // shortcode가 주변 ±8000자 이내에 있는 like_count를 찾음 (앞뒤 모두 탐색)
  const WINDOW = 8000
  let match: RegExpExecArray | null

  let bestLikeMatch: RegExpExecArray | null = null
  while ((match = likeRegex.exec(html)) !== null) {
    const pos = match.index
    const nearby = html.substring(Math.max(0, pos - WINDOW), pos + WINDOW)
    if (nearby.includes(shortcode)) {
      bestLikeMatch = match
      break
    }
  }

  let bestCommentMatch: RegExpExecArray | null = null
  while ((match = commentRegex.exec(html)) !== null) {
    const pos = match.index
    const nearby = html.substring(Math.max(0, pos - WINDOW), pos + WINDOW)
    if (nearby.includes(shortcode)) {
      bestCommentMatch = match
      break
    }
  }

  const like_count = bestLikeMatch ? parseInt(bestLikeMatch[1]) : 0
  const comments_count = bestCommentMatch ? parseInt(bestCommentMatch[1]) : 0

  if (like_count === 0 && comments_count === 0) return null
  return { like_count, comments_count }
}

export async function fetchInstagramMetrics(url: string): Promise<{ like_count: number; comments_count: number } | null> {
  const shortcode = extractShortcode(url)
  if (!shortcode) return null

  const headers = getBrowserHeaders()

  for (const targetUrl of [
    `https://www.instagram.com/p/${shortcode}/`,
    `https://www.instagram.com/reel/${shortcode}/`,
  ]) {
    try {
      const res = await fetch(targetUrl, { headers })
      if (!res.ok) continue
      const html = await res.text()

      const result = extractFromHtml(html, shortcode)
      if (result) return result
    } catch {
      // 다음 URL 시도
    }
  }
  return null
}
