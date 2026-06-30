'use client'

import { useState, useMemo } from 'react'
import { ReferenceCard } from '@/types'
import Link from 'next/link'

const PLATFORM_ICON: Record<string, string> = {
  Instagram: '📷',
  TikTok: '🎵',
  'X (Twitter)': '🐦',
  YouTube: '▶️',
  기타: '🌐',
}

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  TikTok: 'bg-gray-900 text-white',
  'X (Twitter)': 'bg-sky-100 text-sky-700',
  YouTube: 'bg-red-100 text-red-700',
  기타: 'bg-gray-100 text-gray-600',
}

function getPlatform(card: ReferenceCard): string {
  return card.metrics?.['플랫폼'] || card.summary?.split(' · ')[0] || '기타'
}

function getFollowers(card: ReferenceCard): string {
  return card.metrics?.['팔로워 수'] || ''
}

function getQuality(card: ReferenceCard): string {
  return card.metrics?.['퀄리티'] || ''
}

function getPostUrl(card: ReferenceCard): string {
  return card.metrics?.['게시물 URL'] || ''
}

function getExecutedAt(card: ReferenceCard): string {
  return card.metrics?.['실행일'] || ''
}

function getCost(card: ReferenceCard): string {
  return card.metrics?.['비용/보수'] || ''
}

interface Props {
  initialCards: ReferenceCard[]
}

export default function PublicShowcase({ initialCards }: Props) {
  const [selected, setSelected] = useState<ReferenceCard | null>(initialCards[0] ?? null)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('전체')

  const platforms = useMemo(() => {
    const set = new Set(initialCards.map(getPlatform))
    return ['전체', ...Array.from(set)]
  }, [initialCards])

  const filtered = useMemo(() => {
    return initialCards.filter((c) => {
      const matchSearch =
        !search ||
        (c.brand_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
      const matchPlatform =
        platformFilter === '전체' || getPlatform(c) === platformFilter
      return matchSearch && matchPlatform
    })
  }, [initialCards, search, platformFilter])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-semibold text-gray-900">SNS 캠페인 결과</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {initialCards.length}건
          </span>
        </div>
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
          관리자
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - list */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Search + filter */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            <input
              type="text"
              placeholder="계정 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-1 flex-wrap">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    platformFilter === p
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {p !== '전체' && PLATFORM_ICON[p] ? `${PLATFORM_ICON[p]} ` : ''}{p}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">결과 없음</div>
            ) : (
              filtered.map((card) => {
                const platform = getPlatform(card)
                const followers = getFollowers(card)
                const quality = getQuality(card)
                const isActive = selected?.id === card.id
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelected(card)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {card.brand_name || '미설정'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${PLATFORM_COLOR[platform] || 'bg-gray-100 text-gray-600'}`}>
                            {PLATFORM_ICON[platform]} {platform}
                          </span>
                          {followers && (
                            <span className="text-xs text-gray-400">{Number(followers).toLocaleString()}명</span>
                          )}
                        </div>
                      </div>
                      {quality && (
                        <span className="text-xs text-yellow-500 shrink-0 mt-0.5">{quality}</span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Right panel - detail */}
        <main className="flex-1 overflow-y-auto p-8">
          {selected ? (
            <DetailPanel card={selected} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              좌측에서 항목을 선택하세요
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function DetailPanel({ card }: { card: ReferenceCard }) {
  const platform = getPlatform(card)
  const followers = getFollowers(card)
  const quality = getQuality(card)
  const postUrl = getPostUrl(card)
  const executedAt = getExecutedAt(card)
  const cost = getCost(card)

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm px-2 py-0.5 rounded ${PLATFORM_COLOR[platform] || 'bg-gray-100 text-gray-600'}`}>
            {PLATFORM_ICON[platform]} {platform}
          </span>
          {quality && <span className="text-yellow-500">{quality}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{card.brand_name || '미설정'}</h1>
        {executedAt && <p className="text-sm text-gray-400 mt-1">실행일: {executedAt}</p>}
      </div>

      {/* Info grid */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
        <InfoRow label="카테고리" value={card.category} />
        <InfoRow
          label="팔로워 수"
          value={followers ? `${Number(followers).toLocaleString()}명` : '-'}
        />
        <InfoRow label="비용/보수" value={cost || '-'} />
        <InfoRow
          label="게시물 URL"
          value={
            postUrl ? (
              <a href={postUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                {postUrl}
              </a>
            ) : '-'
          }
        />
      </div>

      {/* Memo */}
      {card.description && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">메모</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{card.description}</p>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start px-5 py-3 gap-4">
      <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}
