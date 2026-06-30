'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReferenceCard, CATEGORIES } from '@/types'
import Link from 'next/link'

interface Props {
  initialData?: ReferenceCard
  cardId?: string
}

interface MetricRow {
  key: string
  value: string
}

export default function CardForm({ initialData, cardId }: Props) {
  const router = useRouter()
  const isEdit = !!cardId

  const [brandName, setBrandName] = useState(initialData?.brand_name || '')
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0])
  const [summary, setSummary] = useState(initialData?.summary || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous ?? false)
  const [metrics, setMetrics] = useState<MetricRow[]>(
    initialData?.metrics
      ? Object.entries(initialData.metrics).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: '', value: '' }]
  )
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.image_urls || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addMetric() {
    setMetrics((prev) => [...prev, { key: '', value: '' }])
  }

  function removeMetric(index: number) {
    setMetrics((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMetric(index: number, field: 'key' | 'value', val: string) {
    setMetrics((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: val } : m)))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('reference-images')
        .upload(path, file)

      if (!error) {
        const { data } = supabase.storage.from('reference-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }

    setImageUrls((prev) => [...prev, ...uploaded])
    setUploading(false)
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const metricsObj = metrics
      .filter((m) => m.key.trim())
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

    const payload = {
      brand_name: brandName || null,
      category,
      summary,
      description,
      metrics: metricsObj,
      image_urls: imageUrls,
      is_public: isPublic,
      is_anonymous: isAnonymous,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('reference_cards')
        .update(payload)
        .eq('id', cardId)
      if (error) {
        setError('保存に失敗しました: ' + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('reference_cards')
        .insert({ ...payload, created_by: user?.id })
      if (error) {
        setError('保存に失敗しました: ' + error.message)
        setSaving(false)
        return
      }
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        {/* Brand name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ブランド名
            <span className="text-gray-400 font-normal ml-1">（匿名の場合は空欄可）</span>
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="例：〇〇コスメ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">一行サマリー *</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            placeholder="例：リピート購入率が3ヶ月で2倍に"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">詳細説明 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            placeholder="施策の背景・内容・成果などを詳しく記述してください"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">数値指標</label>
          <button
            type="button"
            onClick={addMetric}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            ＋ 追加
          </button>
        </div>
        <div className="space-y-2">
          {metrics.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={m.key}
                onChange={(e) => updateMetric(i, 'key', e.target.value)}
                placeholder="指標名（例：売上成長率）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={m.value}
                onChange={(e) => updateMetric(i, 'value', e.target.value)}
                placeholder="値（例：＋150%）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeMetric(i)}
                className="px-2 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">画像</label>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {imageUrls.map((url) => (
              <div key={url} className="relative group">
                <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
          <span className="text-sm text-gray-500">
            {uploading ? 'アップロード中...' : 'クリックして画像を追加'}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Toggles */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <Toggle
          label="公開する"
          description="お客様向けのページに表示されます"
          checked={isPublic}
          onChange={setIsPublic}
        />
        <Toggle
          label="ブランド名を匿名にする"
          description="ブランド名を非公開にして「非公開ブランド」として表示"
          checked={isAnonymous}
          onChange={setIsAnonymous}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/admin"
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : isEdit ? '更新する' : '追加する'}
        </button>
      </div>
    </form>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
