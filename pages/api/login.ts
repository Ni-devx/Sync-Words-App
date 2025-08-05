// pages/api/login.ts (修正版)
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定 (変更なし)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { userId, password, clientType } = req.body
  if (!userId || !password) {
    return res.status(400).json({ message: 'ユーザーIDとパスワードは必須です' })
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_id, password_hash') // id(uuid)とuser_id(text)を取得
      .eq('user_id', userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ message: 'ユーザーIDまたはパスワードが正しくありません' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'ユーザーIDまたはパスワードが正しくありません' })
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const expirationTime = clientType === 'extension' 
      ? currentTime + (30 * 24 * 60 * 60)
      : currentTime + (7 * 24 * 60 * 60)

    // 🔥 修正: user.id (UUID文字列) をそのままトークンの 'sub' (subject) クレームとして使用する
    // parseInt() や dbId といった概念は完全に廃止
    const tokenPayload = {
      sub: user.id,                      // 標準的なJWTの subject クレームにUUIDを設定
      userIdString: user.user_id,        // wordsテーブルとの連携用にテキストIDも保持
      name: user.user_id,
      loginTime: Date.now(),
      clientType: clientType === 'extension' ? 'extension' : 'web',
      // 標準フィールド
      iat: currentTime,
      exp: expirationTime
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!);
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', 
      sameSite: 'lax', // CSRF対策
      path: '/',
      maxAge: clientType === 'extension' 
        ? 30 * 24 * 60 * 60 // 30日
        : 7 * 24 * 60 * 60, // 7日
    });

    // レスポンスのヘッダーに「このCookieを保存して」という情報を追加します
    res.setHeader('Set-Cookie', cookie);
    // 【ポイント②ここまで】
    return res.status(200).json({
      message: 'ログイン成功',
      success: true,
      user: {
        id: user.id,
        userId: user.user_id,
        name: user.user_id,
      },
      token: token,
      tokenExpiry: expirationTime * 1000,
      clientType: clientType === 'extension' ? 'extension' : 'web'
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'サーバーエラーが発生しました' })
  }
}