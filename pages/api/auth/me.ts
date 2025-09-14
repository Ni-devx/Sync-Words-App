// pages/api/auth/me.ts (修正版)
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // (CORS設定などは変更なし)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') return res.status(200).end()

  let token: string | null = null;
  if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }
  if (!token) {
      return res.status(401).json({ message: '認証トークンがありません', authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded.sub) {
        return res.status(401).json({ message: '無効なトークンです', authenticated: false });
    }

    // ★★★ 変更点: display_name をSELECTに追加 ★★★
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_id, display_name, created_at')
      .eq('id', decoded.sub)
      .single()

    if (error || !user) {
        return res.status(401).json({ message: '認証に失敗しました', authenticated: false });
    }

    const responseData = {
      message: '認証成功',
      authenticated: true,
      user: {
        id: user.id,
        userId: user.user_id,
        displayName: user.display_name, // ★★★ 変更点: レスポンスに追加 ★★★
        createdAt: user.created_at
      },
    }

    return res.status(200).json(responseData)

  } catch (error) {
    return res.status(401).json({ message: 'トークンが無効または期限切れです', authenticated: false });
  }
}