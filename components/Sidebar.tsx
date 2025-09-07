// components/Sidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

// アイコンの型定義
type IconProps = { className?: string };

// アイコンコンポーネント
const HomeIcon = ({ className }: IconProps) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ListIcon = ({ className }: IconProps) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const LogoutIcon = ({ className }: IconProps) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
// ★★★ 追加点: 設定アイコン ★★★
const SettingsIcon = ({ className }: IconProps) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  // ★★★ 修正点: ナビゲーション項目に「設定」を追加 ★★★
  const navItems = [
    { name: '今日の復習', href: '/app', icon: HomeIcon },
    { name: '単語一覧', href: '/app/words', icon: ListIcon },
    { name: '設定', href: '/setting', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white text-slate-700 border-r border-slate-200 flex flex-col z-30">
      {/* ヘッダー: アプリ名 */}
      <div className="p-6 h-16 flex items-center justify-center border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Sync Words</h1>
      </div>

      {/* ナビゲーション */}
      <nav className="pt-3 flex-1 py-4 px-4 space-y-2">
        <ul>
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* フッター: ログアウト */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          ログアウト
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;