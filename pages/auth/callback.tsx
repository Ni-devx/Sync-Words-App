// pages/auth/callback.tsx または app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router' // App RouterならNext/navigationから
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=callback_error')
      } else {
        router.push('/app') // またはホームページ
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>認証処理中...</p>
    </div>
  )
}