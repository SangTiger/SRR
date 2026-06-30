import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CardForm from '../../CardForm'

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: card, error } = await supabase
    .from('reference_cards')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !card) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">レファレンス編集</h1>
        <p className="text-sm text-gray-500 mt-1">{card.brand_name || card.summary}</p>
      </div>
      <CardForm initialData={card} cardId={id} />
    </div>
  )
}
