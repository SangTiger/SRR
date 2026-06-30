import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminCardList from './AdminCardList'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: cards, error } = await supabase
    .from('reference_cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Failed to fetch cards:', error)

  const allCards = cards || []
  const publicCount = allCards.filter((c) => c.is_public).length
  const anonymousCount = allCards.filter((c) => c.is_anonymous).length

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="総レファレンス数" value={allCards.length} />
        <StatCard label="公開中" value={publicCount} />
        <StatCard label="匿名表示" value={anonymousCount} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">レファレンス一覧</h2>
        <div className="flex gap-2">
          <Link
            href="/admin/notion-sync"
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Notion から同期
          </Link>
          <Link
            href="/admin/cards/new"
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ＋ 新規追加
          </Link>
        </div>
      </div>

      <AdminCardList initialCards={allCards} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
