// pages/api/user/update-display-name.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { newDisplayName } = req.body;
    if (!newDisplayName || newDisplayName.trim().length === 0) {
      return res.status(400).json({ message: '表示名は空にできません' });
    }
    if (newDisplayName.length > 50) {
        return res.status(400).json({ message: '表示名は50文字以内で入力してください' });
    }

    const { error } = await supabase
      .from('users')
      .update({ display_name: newDisplayName.trim() })
      .eq('id', userUuid);

    if (error) throw error;

    res.status(200).json({ message: '表示名が更新されました。' });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'セッションが無効です。' });
    }
    console.error('Display name update error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}