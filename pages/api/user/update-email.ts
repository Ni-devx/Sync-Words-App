// pages/api/user/update-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// メールアドレスの形式を検証する正規表現
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: '認証されていません' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userUuid = decoded.sub;

    const { newEmail } = req.body;
    
    // メールアドレスが空文字列か、有効な形式か検証
    if (newEmail && !emailRegex.test(newEmail)) {
        return res.status(400).json({ message: '無効なメールアドレスの形式です' });
    }

    // newEmailが空文字列の場合は、NULLをセットして登録を解除する
    const valueToUpdate = newEmail.trim() === '' ? null : newEmail.trim();

    const { error } = await supabase
      .from('users')
      .update({ email: valueToUpdate })
      .eq('id', userUuid);

    if (error) {
        // UNIQUE制約違反エラーの場合
        if (error.code === '23505') {
            return res.status(409).json({ message: 'そのメールアドレスは既に使用されています。' });
        }
        throw error;
    }

    res.status(200).json({ message: 'メールアドレスを更新しました。' });

  } catch (error: any) {
    console.error('Email update error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}