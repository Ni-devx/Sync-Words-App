// pages/api/user/update-notification-time.ts
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

    const { newTime } = req.body;
    const time = parseInt(newTime, 10);

    if (isNaN(time) || time < 0 || time > 23) {
      return res.status(400).json({ message: '無効な時間です' });
    }

    const { error } = await supabase
      .from('users')
      .update({ notification_time: time })
      .eq('id', userUuid);

    if (error) throw error;

    res.status(200).json({ message: '通知時間を更新しました。' });

  } catch (error: any) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}