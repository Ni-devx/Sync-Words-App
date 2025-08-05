// pages/api/verify-auth.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // トークン取得（Authorizationヘッダー優先）
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.replace('Bearer ', '').trim();
  } else if (req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return res.status(401).json({ 
      message: 'トークンが提供されていません',
      valid: false 
    })
  }

  try {
    // JWTトークンを検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // ユーザーがまだ存在するか確認
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_id, email, last_login')
      .eq('id', decoded.dbId) // dbIdで検索
      .single()

    if (error || !user) {
      return res.status(401).json({ 
        message: 'ユーザーが見つかりません',
        valid: false 
      })
    }

    // トークンの有効期限をチェック（追加の安全性）
    const tokenAge = Date.now() - (decoded.loginTime || 0)
    const maxAge = decoded.clientType === 'extension' ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ 
        message: 'トークンの有効期限が切れています',
        valid: false 
      })
    }

    return res.status(200).json({
      message: '認証有効',
      valid: true,
      user: {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        lastLogin: user.last_login
      },
      tokenInfo: {
        loginTime: decoded.loginTime,
        clientType: decoded.clientType,
        expiresAt: decoded.exp * 1000 // Unix timestamp to milliseconds
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ 
      message: 'トークンが無効です',
      valid: false,
      error: typeof error === 'object' && error !== null && 'name' in error ? (error as { name?: string }).name : undefined
    })
  }
}