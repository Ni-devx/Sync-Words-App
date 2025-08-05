// pages/api/words.ts (最終修正・完全版)
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function authenticateRequest(req: NextApiRequest) {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }
  if (!token) return { success: false, message: '認証トークンが必要です' };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userIdString) return { success: false, message: 'トークンにユーザー情報が含まれていません' };
    return { success: true, userId: decoded.userIdString };
  } catch (error) {
    return { success: false, message: '認証トークンが無効です' };
  }
}

async function handleGetWords(req: NextApiRequest, res: NextApiResponse) {
  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) return res.status(401).json({ message: auth.message });
  const { date } = req.query;
  let query = supabase.from('words').select('*').eq('user_id', auth.userId);
  if (date && typeof date === 'string') {
    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    query = query.gte('next_review_date', startDate.toISOString()).lt('next_review_date', endDate.toISOString());
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  return res.status(200).json(data);
}

async function handleCreateWord(req: NextApiRequest, res: NextApiResponse) {
  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) return res.status(401).json({ message: auth.message });
  const { word, meaning, sourceUrl } = req.body;
  if (!word) return res.status(400).json({ message: '単語は必須です' });
  const { data, error } = await supabase
    .from('words')
    .insert({
      user_id: auth.userId,
      word: word.trim().toLowerCase(),
      // ★安全な方法に統一
      meaning: meaning ? meaning.trim() : null,
      source_url: sourceUrl,
      next_review_date: new Date().toISOString()
    })
    .select()
    .single();
  if (error) return res.status(500).json({ message: '保存に失敗しました', error: error.message });
  return res.status(201).json({ message: '保存しました', word: data });
}


async function handleUpdateWord(req: NextApiRequest, res: NextApiResponse) {
  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) {
    return res.status(401).json({ message: auth.message });
  }

  const { id, word, meaning } = req.body;
  if (!id || !word || word.trim() === '') {
    return res.status(400).json({ message: '更新対象のIDと単語は必須です。' });
  }

  try {
    const { data, error } = await supabase
      .from('words')
      .update({
        word: word.trim().toLowerCase(),
        meaning: meaning ? meaning.trim() : null,
        // ★★★★★★★★★★★★★★★★★★★★★★★★
        // ★ 存在しないカラムへの更新処理を削除 ★
        // updated_at: new Date().toISOString() 
        // ★★★★★★★★★★★★★★★★★★★★★★★★
      })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) {
      // このエラーはもう発生しないはずです
      console.error('Supabase update error:', error.message);
      return res.status(404).json({ 
          message: '対象の単語が見つからないか、更新に失敗しました。',
          supabase_code: error.code 
      });
    }

    // 成功！
    return res.status(200).json({ message: '更新しました', data });

  } catch (err: any) {
    console.error('Unexpected error in handleUpdateWord:', err);
    return res.status(500).json({ message: 'サーバー内部で予期せぬエラーが発生しました。' });
  }
}


async function handleDeleteWord(req: NextApiRequest, res: NextApiResponse) {
  const auth = await authenticateRequest(req);
  if (!auth.success || !auth.userId) return res.status(401).json({ message: auth.message });
  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ message: '削除する単語のIDが必要です。' });
  const { error } = await supabase.from('words').delete().eq('id', id).eq('user_id', auth.userId);
  if (error) return res.status(500).json({ message: '削除に失敗しました', error: error.message });
  return res.status(200).json({ message: '削除しました' });
}

// メインハンドラ
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  switch (req.method) {
    case 'GET': return handleGetWords(req, res);
    case 'POST': return handleCreateWord(req, res);
    case 'PATCH': return handleUpdateWord(req, res);
    case 'DELETE': return handleDeleteWord(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}