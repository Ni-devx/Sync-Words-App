// pages/update-history.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { updates } from '@/lib/updateHistoryData'; // ★★★ 追加

const UpdateHistoryPage: NextPage = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>更新情報 | Sync Words</title>
        <meta name="description" content="Sync Wordsのアップデート情報ページです。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-[#0A192F] font-sans text-[#ccd6f6] antialiased selection:bg-[#64ffda]/20 min-h-screen">
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-[#0A192F]/80 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-white hover:text-[#64ffda] transition-colors duration-300">Sync Words</Link>
                        <nav className="flex items-center gap-5">
                            <Link href="/login" className="text-sm font-medium text-[#ccd6f6] hover:text-[#64ffda] transition-colors duration-300">ログイン</Link>
                            <Link href="/signup" className="text-sm font-medium bg-[#64ffda] text-[#0A192F] px-4 py-2 rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300">無料で始める</Link>
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
                {/* ★★★ 修正: データから動的に更新履歴を生成 ★★★ */}
                {updates.map((update, index) => (
                  <React.Fragment key={update.version}>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-2">バージョン {update.version}</h2>
                      <p className="text-sm text-[#8892B0] mb-4">{update.date}</p>
                      <div className="space-y-4">
                        {update.changes.map((change, idx) => (
                          <div key={idx} className={idx > 0 ? 'pt-2' : ''}>
                            <h3 className="text-xl font-semibold text-[#ccd6f6] mb-3">【{change.title}】</h3>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                              {change.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 最後の要素以外には区切り線を表示 */}
                    {index < updates.length - 1 && <div className="border-t border-slate-800"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </main>
        
                <footer className="bg-slate-900/70 border-t border-slate-800">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="text-center md:text-left">
                                <Link href="/" className="text-2xl font-semibold text-white">Sync Words</Link>
                                <p className="text-sm text-[#8892B0] mt-2">© {new Date().getFullYear()} Sync Words. All rights reserved.</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#8892B0]">
                                <Link href="/privacy-policy" className="hover:text-[#64ffda] transition-colors">プライバシーポリシー</Link>
                                <Link href="/terms-of-service" className="hover:text-[#64ffda] transition-colors">利用規約</Link>
                                <Link href="/update-history" className="hover:text-[#64ffda] transition-colors">アップデート</Link>
                                <Link href="/guide" className="hover:text-[#64ffda] transition-colors">使い方ガイド</Link>
                            </div>
                        </div>
                    </div>
                </footer>
      </div>
    </>
  );
};

export default UpdateHistoryPage;