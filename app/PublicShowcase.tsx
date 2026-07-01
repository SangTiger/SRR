'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ReferenceCard } from '@/types'

const PLATFORMS = ['Instagram', 'X (Twitter)', 'Lips', '@Cosme', '기타']

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: 'text-pink-600',
  'X (Twitter)': 'text-sky-600',
  Lips: 'text-red-500',
  '@Cosme': 'text-purple-600',
  '기타': 'text-gray-500',
}

const PLATFORM_BADGE: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  'X (Twitter)': 'bg-sky-100 text-sky-700',
  Lips: 'bg-red-100 text-red-600',
  '@Cosme': 'bg-purple-100 text-purple-700',
  '기타': 'bg-gray-100 text-gray-600',
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
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORMS[0])
  const [selectedCard, setSelectedCard] = useState<ReferenceCard | null>(null)
  const [snsOpen, setSnsOpen] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/notion-sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      setSyncMsg(`${data.upserted}건 동기화 완료`)
      router.refresh()
    } catch (e) {
      setSyncMsg('동기화 실패')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(null), 3000)
    }
  }

  const cardsByPlatform = useMemo(() => {
    const map: Record<string, ReferenceCard[]> = {}
    for (const p of PLATFORMS) {
      map[p] = initialCards.filter((c) => getPlatform(c) === p)
    }
    return map
  }, [initialCards])

  const currentCards = cardsByPlatform[selectedPlatform] || []

  function selectPlatform(platform: string) {
    setSelectedPlatform(platform)
    setSelectedCard(null)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-gray-900">storelink.</span>
          <span className="text-gray-400 font-medium">SNS 캠페인</span>
        </div>
        <div className="flex items-center gap-3">
          {syncMsg && <span className="text-xs text-green-600">{syncMsg}</span>}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {syncing ? '동기화 중...' : '동기화'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="py-4">
            {/* SNS 상위 그룹 헤더 */}
            <button
              onClick={() => setSnsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">SNS</span>
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${snsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {snsOpen && PLATFORMS.map((platform) => {
              const count = cardsByPlatform[platform]?.length || 0
              const isActive = selectedPlatform === platform
              const color = PLATFORM_COLOR[platform] || 'text-gray-500'

              return (
                <button
                  key={platform}
                  onClick={() => selectPlatform(platform)}
                  className={`w-full flex items-center justify-between px-7 py-2 transition-colors ${
                    isActive
                      ? 'bg-slate-100 border-l-2 border-l-slate-900'
                      : 'border-l-2 border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : color}`}>
                    {platform}
                  </span>
                  <span className="text-xs text-gray-400">{count}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 overflow-y-auto p-8">
          {selectedCard ? (
            <div>
              <button
                onClick={() => setSelectedCard(null)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {selectedPlatform} 목록으로
              </button>
              <DetailPanel card={selectedCard} />
            </div>
          ) : (
            <PlatformCardList
              platform={selectedPlatform}
              cards={currentCards}
              onSelect={setSelectedCard}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function PlatformCardList({
  platform,
  cards,
  onSelect,
}: {
  platform: string
  cards: ReferenceCard[]
  onSelect: (card: ReferenceCard) => void
}) {
  const badge = PLATFORM_BADGE[platform] || 'bg-gray-100 text-gray-600'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${badge}`}>{platform}</span>
        <span className="text-sm text-gray-400">{cards.length}건</span>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-24 text-gray-400 text-sm">데이터 없음</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const followers = getFollowers(card)
            const quality = getQuality(card)
            const cost = getCost(card)
            return (
              <button
                key={card.id}
                onClick={() => onSelect(card)}
                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-gray-900 truncate">{card.brand_name || '미설정'}</span>
                  {quality && <span className="text-yellow-500 text-sm shrink-0">{quality}</span>}
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  {followers && <div>팔로워 {Number(followers).toLocaleString()}명</div>}
                  {cost && <div>비용 {cost}</div>}
                  {card.category && <div className="text-gray-400">{card.category}</div>}
                </div>
              </button>
            )
          })}
        </div>
      )}
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
  const badge = PLATFORM_BADGE[platform] || 'bg-gray-100 text-gray-600'

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm px-2 py-0.5 rounded font-medium ${badge}`}>{platform}</span>
          {quality && <span className="text-yellow-500">{quality}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{card.brand_name || '미설정'}</h1>
        {executedAt && <p className="text-sm text-gray-400 mt-1">실행일: {executedAt}</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
        <InfoRow label="카테고리" value={card.category} />
        <InfoRow label="팔로워 수" value={followers ? `${Number(followers).toLocaleString()}명` : '-'} />
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
