// pages/api/logout.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cookieを無効にする
  res.setHeader(
    'Set-Cookie',
    serialize('auth_token', '', {
      httpOnly: true,
      secure: false, // ローカル開発時はfalse
      expires: new Date(0),
      path: '/',
      sameSite: 'lax', // strict→lax
    })
  )

  res.status(200).json({ message: 'ログアウトしました' })
}
