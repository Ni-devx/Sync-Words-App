// pages/login.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LoginPage() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }
      router.push('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800">Sync Words</h1>
            <p className="text-slate-500 mt-2">あなたのための、スマートな単語帳。</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-slate-700">ログイン</h2>

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-600 mb-1">ユーザーID</label>
              <input
                id="userId"
                type="text"
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password_login" className="block text-sm font-medium text-slate-600 mb-1">パスワード</label>
              <input
                id="password_login"
                type="password"
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              ) : 'ログイン'}
            </button>
          </form>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            アカウントをお持ちでないですか？{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition">
              サインアップ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}