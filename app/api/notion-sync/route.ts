import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchNotionDatabase, mapNotionPageToCard } from '@/lib/notion'
import { fetchInstagramMetrics } from '@/lib/instagram'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (
    token !== process.env.SUPABASE_SERVICE_ROLE_KEY &&
    token !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Notion 동기화
    const pages = await fetchNotionDatabase()
    const notionIds = pages.map((p) => p.id)

    let upserted = 0
    let deleted = 0
    let errors = 0

    for (const page of pages) {
      try {
        const card = mapNotionPageToCard(page)
        if (!card.summary) continue

        const { error } = await supabase
          .from('reference_cards')
          .upsert(card, { onConflict: 'notion_page_id' })

        if (error) { console.error('Upsert error:', error); errors++ }
        else upserted++
      } catch (e) {
        console.error('Page mapping error:', e); errors++
      }
    }

    if (notionIds.length > 0) {
      const { data: deleteResult, error: deleteError } = await supabase
        .from('reference_cards')
        .delete()
        .not('notion_page_id', 'in', `(${notionIds.map((id) => `"${id}"`).join(',')})`)
        .select()

      if (deleteError) console.error('Delete error:', deleteError)
      else deleted = deleteResult?.length ?? 0
    }

    // 2. Instagram 지표 갱신 (service role로 직접 업데이트)
    const { data: igCards } = await supabase
      .from('reference_cards')
      .select('*')
      .eq('is_public', true)

    const instagramCards = (igCards || []).filter(
      (c: any) => c.metrics?.['플랫폼'] === 'Instagram' && c.metrics?.['게시물 URL']
    )

    let ig_updated = 0
    for (const c of instagramCards) {
      try {
        const metrics = await fetchInstagramMetrics(c.metrics['게시물 URL'])
        if (!metrics) continue

        await supabase
          .from('reference_cards')
          .update({
            metrics: {
              ...c.metrics,
              '좋아요': String(metrics.like_count),
              '댓글': String(metrics.comments_count),
            }
          })
          .eq('id', c.id)

        ig_updated++
      } catch (e) {
        console.error('Instagram metrics error:', e)
      }
    }

    return NextResponse.json({ upserted, deleted, errors, total: pages.length, ig_updated })
  } catch (e) {
    console.error('Notion sync error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
