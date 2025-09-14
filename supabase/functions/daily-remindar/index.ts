// supabase/functions/daily-reminder/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@1.1.0'

// CORSヘッダー: 外部からの呼び出しを許可するための定型文
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Daily reminder function is ready.");

// serve関数でリクエストを待ち受けるのが現在の標準的な記述方法です
serve(async (req) => {
  // CORSのプリフライトリクエストに対応するための定型文
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. 環境変数からSupabaseとResendのクライアントを安全に初期化
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // 2. 現在のUTC時間を取得 (0-23)
    const currentUTCHour = new Date().getUTCHours();
    console.log(`Function invoked at UTC hour: ${currentUTCHour}. Checking for users to notify...`);

    // 3. 通知対象となるユーザーをデータベースから検索
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('user_id, email, timezone_offset, notification_time')
      .not('email', 'is', null); // メールアドレスが登録されているユーザーのみ

    if (userError) throw userError;
    if (!users || users.length === 0) {
      console.log("No users with registered emails found.");
      return new Response(JSON.stringify({ message: "通知対象のユーザーがいません" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 4. ユーザーの現地時間を計算し、「今」通知すべきユーザーを絞り込む
    const usersToNotify = users.filter(user => {
      const offsetHours = parseInt(user.timezone_offset.split(':')[0], 10);
      const userLocalHour = (currentUTCHour + offsetHours + 24) % 24;
      return userLocalHour === user.notification_time;
    });

    if (usersToNotify.length === 0) {
      console.log("No users scheduled for notification at this hour.");
      return new Response(JSON.stringify({ message: "この時間に通知するユーザーはいません" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${usersToNotify.length} users to notify.`);

    // 5. 絞り込んだユーザーにだけ、復習チェックとメール送信を行う
    for (const user of usersToNotify) {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: user.timezone_offset });
      const exclusiveUpperBound = new Date(`${today}T00:00:00${user.timezone_offset}`);
      exclusiveUpperBound.setDate(exclusiveUpperBound.getDate() + 1);

      const { count, error: countError } = await supabaseAdmin
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .lt('next_review_date', exclusiveUpperBound.toISOString());

      if (countError) {
        console.error(`Error counting words for ${user.user_id}:`, countError.message);
        continue; // エラーが発生したユーザーはスキップ
      }

      if (count && count > 0) {
        console.log(`Sending email to ${user.email} for ${count} words.`);
        await resend.emails.send({
          from: 'Sync Words <onboarding@resend.dev>', // Resendのデフォルト送信元アドレス
          to: user.email,
          subject: `今日の復習単語が${count}語あります！`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <p>こんにちは、${user.user_id}さん</p>
              <p>Sync Wordsに本日復習する単語が${count}語あります。さっそく学習を始めましょう！</p>
              <a 
                href="あなたのウェブサイトのURL" 
                style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;"
              >
                Sync Wordsを開く
              </a>
            </div>
          `,
        });
      } else {
        console.log(`User ${user.email} has no words to review today.`);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'リマインダー処理が完了しました' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});