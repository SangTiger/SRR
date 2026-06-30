'use client'

import { useState } from 'react'
import { ReferenceCard, CATEGORIES } from '@/types'
import CategoryBadge from '@/components/CategoryBadge'
import MetricBadge from '@/components/MetricBadge'
import ReferenceCardModal from '@/components/ReferenceCardModal'
import Link from 'next/link'

interface Props {
  initialCards: ReferenceCard[]
}

export default function PublicShowcase({ initialCards }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて')
  const [selectedCard, setSelectedCard] = useState<ReferenceCard | null>(null)

  const categories = ['すべて', ...Array.from(new Set(initialCards.map((c) => c.category)))]

  const filtered = selectedCategory === 'すべて'
    ? initialCards
    : initialCards.filter((c) => c.category === selectedCategory)

  const totalMetrics = {
    brands: initialCards.length,
    avgGrowth: '＋127%',
    satisfaction: '98%',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Pointail</span>
            <span className="text-gray-400 text-sm ml-1">レファレンス</span>
          </div>
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            管理者ログイン
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
            実績・レファレンス集
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            日本のECブランドを<br />次のステージへ
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Pointailが支援してきたブランドの実績をご紹介します。
            データドリブンなマーケティングで、持続的な成長を実現します。
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{totalMetrics.brands}+</div>
              <div className="text-sm text-gray-500 mt-1">支援ブランド数</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-3xl font-bold text-slate-900">{totalMetrics.avgGrowth}</div>
              <div className="text-sm text-gray-500 mt-1">平均売上成長率</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{totalMetrics.satisfaction}</div>
              <div className="text-sm text-gray-500 mt-1">顧客満足度</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reference Cards */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>レファレンスがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((card) => (
              <ReferenceCardTile
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Pointail Inc. All rights reserved.
        </div>
      </footer>

      <ReferenceCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  )
}

function ReferenceCardTile({ card, onClick }: { card: ReferenceCard; onClick: () => void }) {
  const displayName = card.is_anonymous ? '非公開ブランド' : (card.brand_name || '未設定')
  const metrics = card.metrics ? Object.entries(card.metrics).slice(0, 2) : []

  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group"
    >
      {/* Image */}
      {card.image_urls && card.image_urls.length > 0 ? (
        <div className="h-40 overflow-hidden bg-gray-100">
          <img
            src={card.image_urls[0]}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <span className="text-slate-400 text-4xl">📊</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={card.category} />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {displayName}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{card.summary}</p>

        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.map(([key, value]) => (
              <MetricBadge key={key} label={key} value={value} />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
