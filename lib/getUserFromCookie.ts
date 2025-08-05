// lib/getUserFromCookie.ts
import { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  id: string
  user_id: string
  iat: number
  exp: number
}

export function getUserFromCookie(req: NextApiRequest) {
  const token = req.cookies.auth_token

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    return {
      id: decoded.id,
      user_id: decoded.user_id,
    }
  } catch (err) {
    console.error('JWT verification error:', err)
    return null
  }
}
