'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xs">P</span>
            </div>
            <span className="font-semibold">Pointail Admin</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              ダッシュボード
            </Link>
            <Link
              href="/admin/cards/new"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              新規追加
            </Link>
            <Link
              href="/admin/notion-sync"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Notion連携
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}
