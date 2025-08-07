// pages/signup.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignupPage() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password }),
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.message || 'アカウント作成中にエラーが発生しました');
      }
      router.push('/app')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800">Sync Words</h1>
            <p className="text-slate-500 mt-2">新しい英単語学習を、ここから始めよう。</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <form onSubmit={handleSignup} className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-slate-700">サインアップ</h2>
            
            <div>
              <label htmlFor="userId_signup" className="block text-sm font-medium text-slate-600 mb-1">ユーザーID</label>
              <input
                id="userId_signup"
                type="text"
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder='英数字とアンダーバーのみで構成され４文字以上'
              />
            </div>

            <div>
              <label htmlFor="password_signup" className="block text-sm font-medium text-slate-600 mb-1">パスワード</label>
              <input
                id="password_signup"
                type="password"
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder='アルファベットの大文字・小文字・数字から構成され、8文字以上'
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'サインアップ'}
            </button>
          </form>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}