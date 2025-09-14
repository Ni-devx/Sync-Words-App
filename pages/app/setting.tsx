// pages/setting.tsx
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { updates } from '@/lib/updateHistoryData';

// Supabase clientの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- 型定義 ---
interface User {
  userId: string;
  timezoneOffset: string;
  email: string | null;
  notificationTime: number; // ★★★ 追加: ユーザーのメールアドレスを保持 (nullable) ★★★
}

interface SettingPageProps {
  user: User;
}

// --- アイコンコンポーネント ---
const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const timezoneOptions = [ { value: '-12:00', label: '(GMT-12:00) International Date Line West' }, { value: '-11:00', label: '(GMT-11:00) Midway Island, Samoa' }, { value: '-10:00', label: '(GMT-10:00) Hawaii' }, { value: '-09:00', label: '(GMT-09:00) Alaska' }, { value: '-08:00', label: '(GMT-08:00) Pacific Time (US & Canada)' }, { value: '-07:00', label: '(GMT-07:00) Mountain Time (US & Canada)' }, { value: '-06:00', label: '(GMT-06:00) Central Time (US & Canada), Mexico City' }, { value: '-05:00', label: '(GMT-05:00) Eastern Time (US & Canada), Bogota, Lima' }, { value: '-04:00', label: '(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz' }, { value: '-03:30', label: '(GMT-03:30) Newfoundland' }, { value: '-03:00', label: '(GMT-03:00) Brazil, Buenos Aires, Georgetown' }, { value: '-02:00', label: '(GMT-02:00) Mid-Atlantic' }, { value: '-01:00', label: '(GMT-01:00) Azores, Cape Verde Is.' }, { value: '+00:00', label: '(GMT+00:00) Western Europe Time, London, Lisbon, Casablanca' }, { value: '+01:00', label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris' }, { value: '+02:00', label: '(GMT+02:00) Kaliningrad, South Africa' }, { value: '+03:00', label: '(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg' }, { value: '+03:30', label: '(GMT+03:30) Tehran' }, { value: '+04:00', label: '(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi' }, { value: '+04:30', label: '(GMT+04:30) Kabul' }, { value: '+05:00', label: '(GMT+05:00) Yekaterinburg, Islamabad, Karachi, Tashkent' }, { value: '+05:30', label: '(GMT+05:30) Bombay, Calcutta, Madras, New Delhi' }, { value: '+05:45', label: '(GMT+05:45) Kathmandu' }, { value: '+06:00', label: '(GMT+06:00) Almaty, Dhaka, Colombo' }, { value: '+07:00', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' }, { value: '+08:00', label: '(GMT+08:00) Beijing, Perth, Singapore, Hong Kong' }, { value: '+09:00', label: '(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk' }, { value: '+09:30', label: '(GMT+09:30) Adelaide, Darwin' }, { value: '+10:00', label: '(GMT+10:00) Eastern Australia, Guam, Vladivostok' }, { value: '+11:00', label: '(GMT+11:00) Magadan, Solomon Is., New Caledonia' }, { value: '+12:00', label: '(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka' } ];

const SettingPage = ({ user }: SettingPageProps) => {
  const router = useRouter();

  // --- State変数 ---
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', content: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [timezoneOffset, setTimezoneOffset] = useState(user.timezoneOffset);
  const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false);
  const [email, setEmail] = useState(user.email || ''); // ★★★ 追加: メールアドレスのState ★★★
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false); // ★★★ 追加: メール更新中のState ★★★
  const latestUpdates = updates.slice(0, 1);
  const [notificationTime, setNotificationTime] = useState(user.notificationTime); // ★★★ 追加 ★★★
  const [isUpdatingNotificationTime, setIsUpdatingNotificationTime] = useState(false);

  const handleTimezoneUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingTimezone(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/update-timezone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTimezoneOffset: timezoneOffset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: `${err.message}` });
    } finally {
      setIsUpdatingTimezone(false);
    }
  };

  // ★★★ 追加: メールアドレス更新ハンドラ ★★★
  const handleEmailUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingEmail(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: `${err.message}` });
    } finally {
      setIsUpdatingEmail(false);
    }
  };
  
  // --- パスワード更新 ---
  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: 'success', text: data.message });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: `${err.message}` });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- アカウント削除 ---
  const handleAccountDelete = async () => {
    if (deleteConfirmationInput !== user.userId) {
      setMessage({ type: 'error', text: '確認のため、あなたのアカウント名を正しく入力してください。' });
      return;
    }
    setIsDeletingAccount(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await router.push('/login');
    } catch (err: any) {
      setMessage({ type: 'error', text: `${err.message}` });
      setIsDeletingAccount(false);
    }
  };
  
  // --- お問い合わせフォームの入力ハンドラ ---
  const handleContactFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationTimeUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingNotificationTime(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/update-notification-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTime: notificationTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: `${err.message}` });
    } finally {
      setIsUpdatingNotificationTime(false);
    }
  };

  return (
    <>
      <div className="min-w-full mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">設定</h1>
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>{message.text}</div>
        )}
        
        <div className="space-y-8">
          {/* --- 1. アカウント情報 --- */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">アカウント情報</h2>
            </div>
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className='mt-4 space-y-6'> {/* ★★★ 修正: space-y-2 から space-y-6 に変更 ★★★ */}
                <div> {/* ★★★ 追加: アカウント名セクションをdivでラップ ★★★ */}
                  <label className="block text-sm font-medium text-slate-600">アカウント名 (ログインID)</label>
                  <p className="text-slate-800 p-3 bg-slate-100 rounded-lg mt-1">{user.userId}</p> {/* ★★★ 修正: mt-1を追加 ★★★ */}
                  <p className="text-xs text-slate-500 pt-1">現時点ではアカウント名の変更はできません。</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- 2. タイムゾーン変更 --- */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">タイムゾーン変更</h2>
            </div>
            <form onSubmit={handleTimezoneUpdate} className="px-6 pb-6 border-t border-slate-200"> {/* ★★★ 修正: formタグを追加 ★★★ */}
              <div className='mt-4 space-y-2'>
                <label htmlFor="timezone-select" className="block text-sm font-medium text-slate-600">タイムゾーン</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                  <select id="timezone-select" value={timezoneOffset} onChange={e => setTimezoneOffset(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                    {timezoneOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button type="submit" disabled={isUpdatingTimezone} className="flex justify-center items-center bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 shrink-0 w-full sm:w-auto">
                    {isUpdatingTimezone ? <LoadingSpinner /> : '保存'}
                  </button>
                </div>
              </div>
            </form> {/* ★★★ 修正: formタグを閉じる ★★★ */}
          </div>

          {/* --- 3. パスワード変更 --- */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">パスワード変更</h2>
            </div>
            <form onSubmit={handlePasswordUpdate} className="px-6 pb-6 border-t border-slate-200">
              <div className="mt-4 space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-600">新しいパスワード</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="大文字・小文字・数字を含む8文字以上" required />
                  <button type="submit" disabled={isUpdatingPassword} className="flex justify-center items-center bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 shrink-0 w-full sm:w-auto">
                    {isUpdatingPassword ? <LoadingSpinner /> : '変更'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* --- 4. 最新情報 --- */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">最新情報</h2>
            </div>
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className="mt-4 space-y-6">
                {latestUpdates.map((update) => (
                  <div key={update.version}>
                    <p className="text-sm text-slate-500 mb-1">{update.date}</p>
                    <h3 className="text-base font-bold text-slate-800 mb-2">バージョン {update.version}</h3>
                    {update.changes.map((change, index) => (
                      <div key={index} className="mt-1">
                        <p className="font-semibold text-slate-700 text-sm">{change.title}</p>
                        <ul className="list-disc list-inside text-slate-600 text-sm pl-2">
                          {change.details.map((detail, i) => (<li key={i}>{detail}</li>))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/update-history" className="font-semibold text-blue-600 hover:underline text-sm">
                  すべてのアップデート履歴を見る →
                </Link>
              </div>
            </div>
          </div>

          {/* --- 5. お問い合わせ --- */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-800">お問い合わせ</h2>
             </div>
             <form action="https://formspree.io/f/xeolvzzd" method="POST" className="px-6 pb-6 border-t border-slate-200">
                <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-slate-600 mb-1">お名前</label>
                      <input type="text" id="contact-name" name="name" value={contactForm.name} onChange={handleContactFormChange} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-slate-600 mb-1">返信先メールアドレス</label>
                      <input type="email" id="contact-email" name="email" value={contactForm.email} onChange={handleContactFormChange} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                    </div>
                    <div>
                      <label htmlFor="contact-content" className="block text-sm font-medium text-slate-600 mb-1">お問い合わせ内容</label>
                      <textarea id="contact-content" name="content" rows={5} value={contactForm.content} onChange={handleContactFormChange} className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                    </div>
                    <button type="submit" className="w-full bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                      送信
                    </button>
                </div>
             </form>
          </div>

          {/* --- 6. 各種リソース --- */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">各種リソース</h2>
              <div className="mt-4 divide-y divide-slate-200">
                <Link href="/privacy-policy" className="flex justify-between items-center py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 -mx-3 px-3 rounded-md">
                  <span>プライバシーポリシー</span>
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 16 16"><path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"/></svg>
                </Link>
                <Link href="/terms-of-service" className="flex justify-between items-center py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 -mx-3 px-3 rounded-md">
                  <span>利用規約</span>
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 16 16"><path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"/></svg>
                </Link>
                <Link href="/update-history" className="flex justify-between items-center py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 -mx-3 px-3 rounded-md">
                  <span>アップデート履歴</span>
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 16 16"><path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"/></svg>
                </Link>
                <Link href="/guide" className="flex justify-between items-center py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 -mx-3 px-3 rounded-md">
                  <span>使い方ガイド</span>
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 16 16"><path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"/></svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* --- 7. アカウント削除 (Danger Zone) --- */}
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-red-700">アカウント削除</h2>
                  <p className="text-sm text-slate-600 mt-2">
                    この操作は元に戻すことはできません。アカウントを削除すると、保存されているすべての単語データも完全に削除されます。
                  </p>
                </div>
                <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm shrink-0">
                  アカウントを削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- アカウント削除確認モーダル --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full min-w-full" onClick={e => e.stopPropagation()}> {/* ★★★ 修正: min-w-fullをmax-w-lgに変更 ★★★ */}
              <h3 className="text-xl font-bold text-slate-900">本当にアカウントを削除しますか？</h3>
              <p className="text-slate-600 mt-4 text-sm">
                この操作は取り消せません。続行するには、あなたのアカウント名 <strong className="text-red-600">{user.userId}</strong> を入力してください。
              </p>
              
              <div className="my-6">
                <input type="text" value={deleteConfirmationInput} onChange={(e) => setDeleteConfirmationInput(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
              </div>

            <div className="flex justify-end gap-4 mt-8">
              <button type="button" onClick={() => { setIsDeleteModalOpen(false); setMessage(null); }} className="px-6 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                キャンセル
              </button>
              <button type="button" onClick={handleAccountDelete} disabled={deleteConfirmationInput !== user.userId || isDeletingAccount} className="flex justify-center items-center px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                {isDeletingAccount ? <LoadingSpinner /> : 'アカウントを完全に削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies.auth_token;

  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.sub) {
      throw new Error('Invalid token');
    }

    const { data: user, error } = await supabase
    .from('users')
    .select('user_id, timezone_offset, email, notification_time')
    .eq('id', decoded.sub)
    .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    return {
      props: {
        user: {
          userId: user.user_id,
          timezoneOffset: user.timezone_offset,
          email: user.email || null,
          notificationTime: user.notification_time,
        },
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default SettingPage;