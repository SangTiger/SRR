import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL 없음' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      }
    })

    const html = await res.text()

    // 좋아요 수 추출
    const likeMatch = html.match(/"like_count"\s*:\s*(\d+)/) ||
                      html.match(/(\d+)\s*like/i) ||
                      html.match(/"edge_media_preview_like":\{"count":(\d+)/)
    const like_count = likeMatch ? parseInt(likeMatch[1]) : 0

    // 댓글 수 추출
    const commentMatch = html.match(/"comment_count"\s*:\s*(\d+)/) ||
                         html.match(/"edge_media_to_comment":\{"count":(\d+)/) ||
                         html.match(/(\d+)\s*comment/i)
    const comments_count = commentMatch ? parseInt(commentMatch[1]) : 0

    return NextResponse.json({ like_count, comments_count })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
