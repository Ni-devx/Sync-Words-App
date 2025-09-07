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
  // ★★★ フォームの入力状態は管理するが、送信処理はFormspreeに任せる ★★★
  const [contactForm, setContactForm] = useState({ name: '', email: '', content: '' });

  // パスワード変更処理（変更なし）
  const handlePasswordUpdate = async (e: FormEvent) => {
    // ...
  };

  // メールアドレス変更処理（変更なし）
  const handleEmailUpdate = async (e: FormEvent) => {
    // ...
  };

  // 問い合わせフォームの入力ハンドラ（変更なし）
  const handleContactFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  // ★★★ handleContactSubmit 関数は不要になるので削除 ★★★

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">設定</h1>

      {/* ... アカウント設定やアプリケーション情報のセクションは省略 ... */}

      {/* お問い合わせ */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">お問い合わせ</h2>
        {/* ★★★ 修正: formタグをFormspree用に変更 ★★★ */}
        <form
          action="https://formspree.io/f/xeolvzzd" // ← ここに取得したURLを貼る
          method="POST"
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">お名前</label>
            <input
              type="text"
              id="name"
              name="name" // "name"属性が重要
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
              name="email" // "name"属性が重要
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
              name="message" // Formspreeでは content より message が一般的
              rows={5}
              value={contactForm.content}
              onChange={(e) => setContactForm(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            送信
          </button>
        </form>
      </section>
    </div>
  );
};

export default SettingPage;