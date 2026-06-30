import { createClient } from '@/lib/supabase/server'
import PublicShowcase from './PublicShowcase'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: cards, error } = await supabase
    .from('reference_cards')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch cards:', error)
  }

  return <PublicShowcase initialCards={cards || []} />
}
