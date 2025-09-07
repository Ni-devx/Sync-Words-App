// pages/setting.tsx
import { useState, FormEvent, ChangeEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import Link from 'next/link';

const SettingPage = () => {
  const supabase = createClientComponentClient<Database>();
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', content: '' });

  // パスワード変更処理
  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage(`エラー: ${error.message}`);
    } else {
      setMessage('パスワードが正常に更新されました。');
      setNewPassword('');
    }
  };

  // メールアドレス変更処理
  const handleEmailUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setMessage(`エラー: ${error.message}`);
    } else {
      setMessage('確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。');
      setNewEmail('');
    }
  };

  // 問い合わせフォームの入力ハンドラ
  const handleContactFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  // 問い合わせフォーム送信処理
  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    // ここでAPIルートにフォームデータを送信するなどのバックエンド処理を実装します。
    // 今回は送信されたことをユーザーに通知するメッセージのみ表示します。
    console.log('問い合わせ内容:', contactForm);
    setMessage('お問い合わせありがとうございます。内容を確認し、追ってご連絡いたします。');
    setContactForm({ name: '', email: '', content: '' });
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">設定</h1>

      {message && <p className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg">{message}</p>}

      <div className="space-y-12">
        {/* アカウント設定 */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">アカウント</h2>
          <div className="space-y-6">
            {/* メールアドレス変更 */}
            <div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">メールアドレスの変更・連携</h3>
              <form onSubmit={handleEmailUpdate} className="flex flex-col sm:flex-row gap-4 items-start">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="新しいメールアドレス"
                  className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  変更
                </button>
              </form>
            </div>
            {/* パスワード変更 */}
            <div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">パスワードの変更</h3>
               <form onSubmit={handlePasswordUpdate} className="flex flex-col sm:flex-row gap-4 items-start">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワード"
                  className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  minLength={6}
                />
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  変更
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* アプリケーション情報 */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">アプリケーション</h2>
           <div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">アップデート情報</h3>
              <p className="text-slate-500 mb-3">最新のアップデート履歴を確認できます。</p>
              <Link href="/update-history" className="font-semibold text-blue-600 hover:underline">
                アップデート履歴を見る
              </Link>
            </div>
        </section>

        {/* お問い合わせ */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">お問い合わせ</h2>
           <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">お名前</label>
              <input
                type="text"
                id="name"
                name="name"
                value={contactForm.name}
                onChange={handleContactFormChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">返信先メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactFormChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
             <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-600 mb-1">お問い合わせ内容</label>
              <textarea
                id="content"
                name="content"
                rows={5}
                value={contactForm.content}
                onChange={(e) => handleContactFormChange(e)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
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