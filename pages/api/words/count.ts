// pages/api/words/count.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 安全な認証関数 (review.tsと共通)
async function authenticateRequest(req: NextApiRequest) {
  const token = req.cookies.auth_token;
  if (!token) {
    return { success: false, message: '認証トークンが必要です。' };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userIdString) {
      return { success: false, message: 'トークンにユーザー情報が含まれていません。' };
    }
    return { success: true, userId: decoded.userIdString };
  } catch (error) {
    return { success: false, message: '認証トークンが無効、または期限切れです。' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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
    const exclusiveUpperBoundJST = new Date(`${date}T00:00:00+09:00`);
    exclusiveUpperBoundJST.setDate(exclusiveUpperBoundJST.getDate() + 1);

    const { count, error } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.userId) // 認証したユーザーIDを使用
      .lt('next_review_date', exclusiveUpperBoundJST.toISOString());
  
    if (error) {
      console.error('Supabase count query error:', error);
      return res.status(500).json({ message: 'データベースエラーが発生しました。', details: error.message });
    }
    
    return res.status(200).json({ count: count ?? 0 });
  
  } catch(e) {
    console.error('Unexpected server error in count.ts:', e);
    return res.status(500).json({ message: 'サーバーで予期せぬエラーが発生しました。' })
  }
}