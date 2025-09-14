// pages/api/words/review.ts (フルコード)
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// (ここに上記の新しい authenticateRequest 関数を貼り付け)
// 安全な認証関数 (count.tsとreview.tsで共通)
async function authenticateRequest(req: NextApiRequest) {
  const token = req.cookies.auth_token;
  if (!token) {
    return { success: false, message: '認証トークンが必要です。' };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // トークンからユーザーのUUID (sub) を取得
    if (!decoded.sub) {
      return { success: false, message: 'トークンにユーザー情報が含まれていません。' };
    }

    // データベースからユーザーIDとタイムゾーンオフセットを取得
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, timezone_offset')
      .eq('id', decoded.sub) // UUIDで検索
      .single();

    if (error || !user) {
      return { success: false, message: 'ユーザーが見つかりません。' };
    }

    return { success: true, userId: user.user_id, timezoneOffset: user.timezone_offset };
  } catch (error) {
    return { success: false, message: '認証トークンが無効、または期限切れです。' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ★★★ 変更点: timezoneOffsetも受け取る ★★★
  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) {
    return res.status(401).json({ message: auth.message });
  }

  const { date } = req.query;
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'A valid date in YYYY-MM-DD format is required' });
  }

  try {
    // ユーザーのタイムゾーンオフセットを検証し、無効な場合はUTCをデフォルトとして使用
    const offsetRegex = /^[+-]\d{2}:\d{2}$/;
    const timezoneOffset = auth.timezoneOffset && offsetRegex.test(auth.timezoneOffset)
      ? auth.timezoneOffset
      : '+00:00';

    // ★★★ 変更点: ハードコードされた '+09:00' をユーザーのタイムゾーンに置き換え ★★★
    const exclusiveUpperBound = new Date(`${date}T00:00:00${timezoneOffset}`);
    exclusiveUpperBound.setDate(exclusiveUpperBound.getDate() + 1);

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', auth.userId)
      .lt('next_review_date', exclusiveUpperBound.toISOString());

    if (error) {
      console.error('Supabase fetch review words error:', error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
}