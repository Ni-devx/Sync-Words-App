// pages/api/user/update-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Supabaseの管理者クライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Cookieから認証トークンを取得
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: '認証されていません' });
    }

    // 2. トークンを検証し、ユーザーのUUIDを取得
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.sub) {
      return res.status(401).json({ message: '無効なトークンです' });
    }
    const userUuid = decoded.sub;

    // 3. リクエストボディから新しいパスワードを取得
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: '新しいパスワードが必要です' });
    }

    // 4. パスワードのバリデーション (signup.tsから流用)
    const passwordErrors = [];
    if (newPassword.length < 8) passwordErrors.push('8文字以上');
    if (!/[a-z]/.test(newPassword)) passwordErrors.push('小文字を1文字以上');
    if (!/[A-Z]/.test(newPassword)) passwordErrors.push('大文字を1文字以上');
    if (!/[0-9]/.test(newPassword)) passwordErrors.push('数字を1文字以上');
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: `パスワード要件: ${passwordErrors.join('、')}` });
    }

    // 5. 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. データベースを更新
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userUuid); // ★★★ UUID('id')でユーザーを特定

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'パスワードが正常に更新されました。' });

  } catch (error: any) {
    // JWTの検証失敗エラー
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'セッションが無効です。再度ログインしてください。' });
    }
    console.error('Password update error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}