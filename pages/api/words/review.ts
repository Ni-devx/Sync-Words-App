// pages/api/words/review.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 安全な認証関数 (count.tsと共通)
async function authenticateRequest(req: NextApiRequest) {
  const token = req.cookies.auth_token;
  if (!token) return { success: false, message: '認証トークンが必要です' };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userIdString) throw new Error();
    return { success: true, userId: decoded.userIdString };
  } catch (error) {
    return { success: false, message: '認証トークンが無効です' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) {
    return res.status(401).json({ message: auth.message });
  }

  const { date } = req.query;
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'A valid date in YYYY-MM-DD format is required' });
  }

  try {
    // ★★★ 改善点 (count.tsと全く同じロジック) ★★★
    const exclusiveUpperBoundJST = new Date(`${date}T00:00:00+09:00`);
    exclusiveUpperBoundJST.setDate(exclusiveUpperBoundJST.getDate() + 1);

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', auth.userId)
      // gte条件を削除し、「今日の終わり」以前のすべての単語を取得
      .lt('next_review_date', exclusiveUpperBoundJST.toISOString());

    if (error) {
      console.error('Supabase fetch review words error:', error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
}