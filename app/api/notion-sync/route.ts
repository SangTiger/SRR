import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchNotionDatabase, mapNotionPageToCard } from '@/lib/notion'

export async function POST(request: Request) {
  // Verify request is from authenticated admin (bearer token = service role)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pages = await fetchNotionDatabase()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let upserted = 0
    let errors = 0

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

    return NextResponse.json({ upserted, errors, total: pages.length })
  } catch (e) {
    console.error('Notion sync error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
