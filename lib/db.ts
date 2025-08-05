import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 読み取りにサービスロールを使う
)

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id') // uuidのidとログイン用user_idの両方を取得
    .eq('id', userId)
    .single()

  if (error) {
    console.error('getUserById error:', error)
    return null
  }

  return data
}
