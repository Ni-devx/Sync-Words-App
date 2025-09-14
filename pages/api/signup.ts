import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { user_id, password } = req.body
  if (!user_id || !password) {
    return res.status(400).json({ message: 'user_id and password are required' })
  }

  // ユーザーIDのバリデーション
  if (user_id.length < 4) {
    return res.status(400).json({ message: 'ユーザーIDは4文字以上で入力してください。' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(user_id)) {
    return res.status(400).json({ message: 'ユーザーIDには英数字とアンダーバー(_)のみ使用できます。' });
  }

  // パスワードのバリデーション
  const passwordErrors = [];
  if (password.length < 8) {
    passwordErrors.push('8文字以上であること');
  }
  if (!/[a-z]/.test(password)) {
    passwordErrors.push('小文字を1文字以上含めること');
  }
  if (!/[A-Z]/.test(password)) {
    passwordErrors.push('大文字を1文字以上含めること');
  }
  if (!/[0-9]/.test(password)) {
    passwordErrors.push('数字を1文字以上含めること');
  }

  if (passwordErrors.length > 0) {
    return res.status(400).json({ message: `パスワードは次の要件を満たす必要があります: ${passwordErrors.join('、')}` });
  }

  // 同じuser_idの存在確認
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', user_id)
    .single()

  if (existingUser) {
    return res.status(409).json({ message: 'そのユーザーIDはすでに存在します' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ user_id, password_hash: hashedPassword, display_name: user_id, timezone_offset: '0', notification_time: 9 })
    .select('*')
    .single()

  if (error || !newUser) {
    console.log("Supabase createUser result:", { error, newUser });
    return res.status(500).json({ message: 'ユーザー作成に失敗しました' })
  }

  // --- ★ 修正箇所 ここから ★ ---
  // login.ts と同じ形式のトークンペイロードを生成します。
  const currentTime = Math.floor(Date.now() / 1000)
  const expirationTime = currentTime + (7 * 24 * 60 * 60) // 7日間

  const tokenPayload = {
      sub: newUser.id,                      // 標準のsubjectクレームにUUIDを設定
      userIdString: newUser.user_id,        // 'user_id' -> 'userIdString' にキー名を変更
      name: newUser.user_id,
      loginTime: Date.now(),
      clientType: 'web',                    // Webからのサインアップと仮定
      iat: currentTime,
      exp: expirationTime
  }
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!);
  // --- ★ 修正箇所 ここまで ★ ---


  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // 本番環境ではtrueに
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ message: 'サインアップ成功' })
}