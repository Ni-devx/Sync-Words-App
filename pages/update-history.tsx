// pages/update-history.tsx などのファイル名で保存してください

import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// --- クライアントサイドでのマウント状態を安全に管理するカスタムフック ---
const useIsMounted = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    return isMounted;
};

const UpdateHistoryPage: NextPage = () => {
  const isMounted = useIsMounted();

  return (
    <>
      <Head>
        <title>更新情報 | Sync Words</title>
        <meta name="description" content="Sync Wordsのアップデート情報ページです。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-[#0A192F] font-sans text-[#ccd6f6] antialiased selection:bg-[#64ffda]/20 min-h-screen">
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-[#0A192F]/50 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-[#64ffda] transition-colors duration-300">
              Sync Words
            </Link>
            <nav className="flex items-center gap-5">
              <Link href="/login" className="text-sm font-medium text-[#ccd6f6] hover:text-[#64ffda] transition-colors duration-300">
                ログイン
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-[#64ffda] text-[#0A192F] px-4 py-2 rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300">
                無料で始める
              </Link>
            </nav>
          </div>
        </header>

        <main className="pt-24 min-h-screen">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-full mx-auto">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-10">
                アップデート
              </h1>
              
              <div className="space-y-12 text-[#8892B0] leading-loose">

                {/* ===== 新しい更新履歴は、この下にコピーして追加してください ===== */}
                
{/*

                <section>
                  <h2 className="text-2xl font-bold text-white mb-2">バージョン 1.2.0</h2>
                  <p className="text-sm text-[#8892B0] mb-4">2025年8月5日</p>
                  <div className="space-y-4">
                      <div>
                          <h3 className="text-xl font-semibold text-[#ccd6f6] mb-3">【新機能】</h3>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>ダークモードに対応しました。設定画面から切り替えられます。</li>
                            <li>学習リマインダー機能を追加しました。毎日指定した時間に通知します。</li>
                          </ul>
                      </div>
                      <div className="pt-2">
                          <h3 className="text-xl font-semibold text-[#ccd6f6] mb-3">【改善】</h3>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>単語登録画面のUIを改善し、より直感的に操作できるようになりました。</li>
                            <li>アプリ全体のパフォーマンスを向上させ、動作を高速化しました。</li>
                          </ul>
                      </div>
                  </div>
                </section>

                <div className="border-t border-slate-800"></div>

*/}
                
                <section>
                  <h2 className="text-2xl font-bold text-white mb-2">バージョン 1.1.0</h2>
                  <p className="text-sm text-[#8892B0] mb-4">2025年8月7日</p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>アカウント登録時のユーザIDとパスワードの設定要件を明確に記載しました。</li>
                    <li>利用規約、プライバシーポリシーを変更しました。</li>
                    <li>その他軽微なUIの改善を行いました。</li>
                  </ul>
                </section>

                <div className="border-t border-slate-800"></div>
                
                <section>
                  <h2 className="text-2xl font-bold text-white mb-2">バージョン 1.0.0</h2>
                  <p className="text-sm text-[#8892B0] mb-4">2025年8月6日</p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Sync Words のサービス提供を開始しました。</li>
                  </ul>
                </section>

              </div>
            </div>
          </div>
        </main>
                <footer className="bg-slate-900 border-t border-slate-800">
                    <div className="container mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 items-start pt-4 pb-4">
                        
                        <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3"><Image src="/images/icon.jpg" alt="アイコン" width={48} height={48} /><span className="text-2xl font-semibold text-white">Sync Words</span></div>
                        <div className="text-sm text-[#8892B0]">Sync Words, {new Date().getFullYear()}</div>
                        </div>

                        {/* items-end を items-start に変更 */}
                        <div className="flex flex-col items-start space-y-3 text-sm text-[#8892B0]">
                        <span className="font-semibold text-white text-xl">リソース</span>
                        <Link href="/privacy-policy" legacyBehavior><a className="hover:text-[#64ffda] transition-colors">プライバシーポリシー</a></Link>
                        <Link href="/terms-of-service" legacyBehavior><a className="hover:text-[#64ffda] transition-colors">利用規約</a></Link>
                        <Link href="/update-history" legacyBehavior><a className="hover:text-[#64ffda] transition-colors">アップデート</a></Link>
                        </div>

                    </div>
                    </div>
                </footer>
      </div>
    </>
  );
};

export default UpdateHistoryPage;