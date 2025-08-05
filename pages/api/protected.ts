// pages/api/protected.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromCookie } from '@/lib/getUserFromCookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromCookie(req)

  if (!user) {
    return res.status(401).json({ message: '未認証のアクセスです' })
  }

  return res.status(200).json({ message: `ようこそ、${user.user_id}さん！` })
}
