// pages/api/words/update.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 既存のwords.tsから認証関数をコピー
async function authenticateRequest(req: NextApiRequest) {
  let token: string | undefined = undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }
  if (!token) {
    return { success: false, message: '認証トークンが必要です' };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userIdString) {
      return { success: false, message: 'トークンにユーザー情報が含まれていません' };
    }
    return { success: true, userId: decoded.userIdString };
  } catch (error) {
    return { success: false, message: '認証トークンが無効です' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 認証チェック
  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) {
    return res.status(401).json({ message: auth.message });
  }

  const { id, next_review_date } = req.body;

  // リクエストボディの必須項目をチェック
  if (!id || !next_review_date) {
    return res.status(400).json({ message: '単語のIDと次の復習日は必須です。' });
  }

  try {
    const { data, error } = await supabase
      .from('words')
      .update({ next_review_date: next_review_date }) // 次の復習日を更新
      .eq('id', id)                                   // 対象の単語ID
      .eq('user_id', auth.userId)                     // ★重要：所有者本人でなければ更新させない
      .select()
      .single();

    if (error) {
      // 対象の単語が見つからなかった、などのDBエラー
      console.error('Supabase update error:', error);
      return res.status(500).json({ message: '単語の更新に失敗しました。', details: error.message });
    }
    
    return res.status(200).json({ message: '更新成功', data });

  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ message: 'サーバーエラーが発生しました。', error: error.message });
  }
}