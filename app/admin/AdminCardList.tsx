'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReferenceCard } from '@/types'
import CategoryBadge from '@/components/CategoryBadge'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialCards: ReferenceCard[]
}

export default function AdminCardList({ initialCards }: Props) {
  const router = useRouter()
  const [cards, setCards] = useState(initialCards)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('すべて')
  const [deleteTarget, setDeleteTarget] = useState<ReferenceCard | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categories = ['すべて', ...Array.from(new Set(initialCards.map((c) => c.category)))]

  const filtered = cards.filter((c) => {
    const matchSearch =
      !search ||
      c.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'すべて' || c.category === categoryFilter
    return matchSearch && matchCat
  })

  async function handleDelete(card: ReferenceCard) {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('reference_cards').delete().eq('id', card.id)
    if (!error) {
      setCards((prev) => prev.filter((c) => c.id !== card.id))
    }
    setDeleteTarget(null)
    setDeleting(false)
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="ブランド名・キーワードで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>レファレンスがありません</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">ブランド名</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">カテゴリ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">サマリー</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">公開</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">匿名</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {card.is_anonymous ? (
                      <span className="text-gray-400">非公開</span>
                    ) : (
                      card.brand_name || <span className="text-gray-400">未設定</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={card.category} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate hidden sm:table-cell">
                    {card.summary}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${card.is_public ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${card.is_anonymous ? 'bg-orange-400' : 'bg-gray-200'}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/cards/${card.id}/edit`}
                        className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(card)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">削除の確認</h3>
            <p className="text-sm text-gray-600 mb-6">
              「{deleteTarget.brand_name || deleteTarget.summary}」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
