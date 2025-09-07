// pages/setting.tsx
import { useState, FormEvent, ChangeEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { updates } from '@/lib/updateHistoryData'; // ★★★ 追加

const SettingPage = () => {
  const supabase = createClientComponentClient<Database>();
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', content: '' });

  // ★★★ 追加: 最新のアップデート情報2件を取得 ★★★
  const latestUpdates = updates.slice(0, 2);

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(`エラー: ${error.message}`);
    else {
      setMessage('パスワードが正常に更新されました。');
      setNewPassword('');
    }
  };

  const handleEmailUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) setMessage(`エラー: ${error.message}`);
    else {
      setMessage('確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。');
      setNewEmail('');
    }
  };

  const handleContactFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">設定</h1>

      {message && <p className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg">{message}</p>}

      <div className="space-y-12">
        {/* アカウント設定 */}
        <section>
           {/* ... (アカウント設定のフォーム部分は変更なし) ... */}
        </section>

        {/* ★★★ 修正: アプリケーション情報セクション ★★★ */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">最新情報</h2>
          <div className="space-y-6">
            {latestUpdates.map((update) => (
              <div key={update.version} className="p-4 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">{update.date}</p>
                <h3 className="text-lg font-bold text-slate-800 mb-2">バージョン {update.version}</h3>
                {update.changes.map((change, index) => (
                  <div key={index} className="mt-1">
                    <p className="font-semibold text-slate-600 text-sm">{change.title}</p>
                    <ul className="list-disc list-inside text-slate-600 text-sm pl-2">
                      {change.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/update-history" className="font-semibold text-blue-600 hover:underline">
              すべてのアップデート履歴を見る →
            </Link>
          </div>
        </section>

        {/* お問い合わせ */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">お問い合わせ</h2>
          <form
            action="https://formspree.io/f/xeolvzzd"
            method="POST"
            className="space-y-4"
          >
            {/* ... (お問い合わせフォーム部分は変更なし) ... */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">返信先メールアドレス</label>
              <input type="email" id="email" name="email" value={contactForm.email} onChange={handleContactFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-600 mb-1">お問い合わせ内容</label>
              <textarea id="content" name="message" rows={5} value={contactForm.content} onChange={(e) => setContactForm(prev => ({ ...prev, content: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <button type="submit" className="w-full bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              送信
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SettingPage;