// pages/api/auth/me.ts (修正版)
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定など (変更なし)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  let token: string | null = null;
  try {
    if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '')
    } else if (req.cookies.auth_token) {
      token = req.cookies.auth_token
    }

    if (!token) {
        return res.status(401).json({ message: 'トークンが提供されていません', authenticated: false, error: 'NO_TOKEN' });
    }
    
    // 🔥 修正: 'decoded.sub' に UUID が入っていることを期待する
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded.sub || typeof decoded.sub !== 'string') {
        return res.status(401).json({ message: 'トークンにユーザー情報が含まれていません', authenticated: false, error: 'INVALID_TOKEN_STRUCTURE' });
    }

    // 🔥 修正: `id` カラム (uuid型) を `decoded.sub` (トークンから取得したuuid文字列) で検索
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_id, created_at')
      .eq('id', decoded.sub) // `decoded.dbId` を `decoded.sub` に変更
      .single()

    if (error || !user) {
        // ... エラーレスポンス
        const debugInfo = error ? { dbError: error.message, dbCode: error.code } : { error: "user not found" };
        return res.status(401).json({
            message: '認証に失敗しました。ユーザーが見つかりません。',
            authenticated: false,
            debug: debugInfo
        });
    }




    // トークン有効期限チェック (変更なし)
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp && now > decoded.exp) {
        return res.status(401).json({ message: 'トークンの有効期限が切れています', authenticated: false, error: 'TOKEN_EXPIRED' })
    }




    const responseData = {
      message: '認証成功',
      authenticated: true,
      user: {
        id: user.id,
        userId: user.user_id,
        name: user.user_id,
        createdAt: user.created_at
      },
      // ... tokenInfoなど
    }

    return res.status(200).json(responseData)

  } catch (error) {
    // ... エラーハンドリング
    return res.status(401).json({ message: 'トークンが無効です', authenticated: false, error: (error as Error).name });
  }
}