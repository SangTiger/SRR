'use client'

import { useEffect } from 'react'
import { ReferenceCard } from '@/types'
import CategoryBadge from './CategoryBadge'
import MetricBadge from './MetricBadge'

interface Props {
  card: ReferenceCard | null
  onClose: () => void
}

export default function ReferenceCardModal({ card, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!card) return null

  const displayName = card.is_anonymous ? '非公開ブランド' : (card.brand_name || '未設定')
  const metrics = card.metrics ? Object.entries(card.metrics) : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {card.image_urls && card.image_urls.length > 0 && (
          <div className="relative h-56 overflow-hidden rounded-t-2xl bg-gray-100">
            <img
              src={card.image_urls[0]}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CategoryBadge category={card.category} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-gray-600 mt-1">{card.summary}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {metrics.map(([key, value]) => (
                <MetricBadge key={key} label={key} value={value} />
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {card.description}
          </div>

          {card.image_urls && card.image_urls.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {card.image_urls.slice(1).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
