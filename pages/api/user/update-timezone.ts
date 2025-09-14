// pages/api/user/update-timezone.ts
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

    const { newTimezoneOffset } = req.body;
    // 簡単なバリデーション
    if (!newTimezoneOffset || !/^([+-])(0[0-9]|1[0-4]):(00|30|45)$/.test(newTimezoneOffset)) {
      return res.status(400).json({ message: '無効なタイムゾーン形式です' });
    }

    const { error } = await supabase
      .from('users')
      .update({ timezone_offset: newTimezoneOffset })
      .eq('id', userUuid);

    if (error) throw error;

    res.status(200).json({ message: 'タイムゾーンが更新されました。' });

  } catch (error: any) {
    console.error('Timezone update error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}