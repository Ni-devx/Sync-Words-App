// pages/api/words/batch.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 他のAPIと共通の認証関数
async function authenticateRequest(req: NextApiRequest) {
  let token: string | undefined = undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) return { success: false, message: '認証トークンが必要です' };

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

  const { pairs } = req.body;

  // 送られてきたデータが配列で、中身が空でないことを確認
  if (!Array.isArray(pairs) || pairs.length === 0) {
    return res.status(400).json({ message: '登録する単語のペアが必要です。' });
  }

  try {
    // 【★最重要ポイント★】
    // フロントから送られてきた単語ペアの配列を、Supabaseにinsertできる形式の配列に変換する
    const wordsToInsert = pairs.map(pair => ({
      user_id: auth.userId,                      // 認証済みユーザーのID
      word: pair.word.trim().toLowerCase(),      // 単語（整形）
      meaning: pair.meaning.trim(),              // 意味（整形）
      next_review_date: new Date().toISOString() // ルール通り「今日」をセット！
    }));

    // 整形したデータの配列を使い、一括でinsert処理を実行
    const { data, error } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select();

    if (error) {
      console.error('Supabase batch insert error:', error);
      throw new Error(error.message); // エラーをcatchブロックに投げる
    }

    return res.status(201).json({});

  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ message: '一括登録中にエラーが発生しました。', error: error.message });
  }
}