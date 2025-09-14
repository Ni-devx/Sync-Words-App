// pages/api/user/delete-account.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// Supabaseの管理者クライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    // 3. usersテーブルからユーザーを削除
    // (テーブル設定でON DELETE CASCADEが設定されていれば、関連するwordsも削除される)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userUuid); // ★★★ UUID('id')でユーザーを特定

    if (error) {
      throw error;
    }

    // 4. ログアウト処理としてCookieを無効化
    const cookie = serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      expires: new Date(0), // Cookieの有効期限を過去に設定
      path: '/',
      sameSite: 'lax',
    });
    res.setHeader('Set-Cookie', cookie);

    res.status(200).json({ message: 'アカウントが正常に削除されました。' });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'セッションが無効です。再度ログインしてください。' });
    }
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}