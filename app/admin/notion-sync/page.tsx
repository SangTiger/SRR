'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface SyncResult {
  upserted: number
  errors: number
  total: number
}

export default function NotionSyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const notionConfigured =
    typeof window !== 'undefined'
      ? true
      : Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID)

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setResult(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/notion-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Sync failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Notion 連携</h1>
        <p className="text-sm text-gray-500 mt-1">
          Notion データベースからレファレンス情報を同期します
        </p>
      </div>

      {/* Setup guide */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-medium text-gray-900 mb-4">セットアップ手順</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="shrink-0 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Notion インテグレーション
              </a>
              を作成して API キーを取得
            </div>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              同期したい Notion データベースを開き、右上メニュー → 「コネクト」→ 作成したインテグレーションを追加
            </div>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              データベース URL の <code className="bg-gray-100 px-1 rounded">notion.so/xxx/<strong>DATABASE_ID</strong>?v=...</code> 部分をコピー
            </div>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <code className="bg-gray-100 px-1 rounded">.env.local</code> に以下を追加：
              <pre className="mt-2 bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono overflow-x-auto">
{`NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
              </pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
            <div>
              Notion データベースに以下のプロパティを作成：
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono space-y-1">
                <div><span className="text-purple-600">ブランド名</span> → タイトル（Title）</div>
                <div><span className="text-purple-600">カテゴリ</span> → セレクト</div>
                <div><span className="text-purple-600">サマリー</span> → テキスト</div>
                <div><span className="text-purple-600">説明</span> → テキスト</div>
                <div><span className="text-purple-600">公開</span> → チェックボックス</div>
                <div><span className="text-purple-600">匿名</span> → チェックボックス</div>
                <div><span className="text-purple-600">（数値）</span> → 数値型プロパティは自動で指標として取込み</div>
              </div>
            </div>
          </li>
        </ol>
      </div>

      {/* Sync button */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-medium text-gray-900 mb-2">同期を実行</h2>
        <p className="text-sm text-gray-500 mb-4">
          Notion データベースの内容を取得してレファレンスカードに反映します。
          既存のカードは上書き更新されます。
        </p>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {syncing ? '同期中...' : 'Notion から同期する'}
        </button>

        {result && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <div className="font-medium text-green-800 mb-1">✓ 同期完了</div>
            <div className="text-green-700">
              合計 {result.total} 件中 {result.upserted} 件を同期しました。
              {result.errors > 0 && ` (エラー: ${result.errors} 件)`}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            <div className="font-medium mb-1">エラーが発生しました</div>
            <div>{error}</div>
            <div className="mt-2 text-xs text-red-600">
              .env.local の NOTION_API_KEY と NOTION_DATABASE_ID を確認してください
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
