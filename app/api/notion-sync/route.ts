import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchNotionDatabase, mapNotionPageToCard } from '@/lib/notion'

export async function POST(request: Request) {
  // Verify request is from authenticated admin (bearer token = service role)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (
    token !== process.env.SUPABASE_SERVICE_ROLE_KEY &&
    token !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pages = await fetchNotionDatabase()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let upserted = 0
    let deleted = 0
    let errors = 0

    const notionIds = pages.map((p) => p.id)

    for (const page of pages) {
      try {
        const card = mapNotionPageToCard(page)
        if (!card.summary) continue

        const { error } = await supabase
          .from('reference_cards')
          .upsert(card, { onConflict: 'notion_page_id' })

        if (error) {
          console.error('Upsert error:', error)
          errors++
        } else {
          upserted++
        }
      } catch (e) {
        console.error('Page mapping error:', e)
        errors++
      }
    }

    // 노션에서 삭제된 항목 Supabase에서도 삭제
    if (notionIds.length > 0) {
      const { data: deleteResult, error: deleteError } = await supabase
        .from('reference_cards')
        .delete()
        .not('notion_page_id', 'in', `(${notionIds.map((id) => `"${id}"`).join(',')})`)
        .select()

      if (deleteError) {
        console.error('Delete error:', deleteError)
      } else {
        deleted = deleteResult?.length ?? 0
      }
    }

    return NextResponse.json({ upserted, deleted, errors, total: pages.length })
  } catch (e) {
    console.error('Notion sync error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
