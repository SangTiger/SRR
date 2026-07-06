import { NextResponse } from 'next/server'
import { fetchInstagramMetrics } from '@/lib/instagram'

export async function POST(request: Request) {
  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL 없음' }, { status: 400 })

  const result = await fetchInstagramMetrics(url)
  if (!result) {
    return NextResponse.json({ like_count: 0, comments_count: 0, note: '수집 불가 (비공개 또는 로그인 필요)' })
  }
  return NextResponse.json(result)
}
