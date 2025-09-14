// pages/guide.tsx

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

const GuidePage: NextPage = () => {
  const isMounted = useIsMounted();

  return (
    <>
      <Head>
        <title>使い方ガイド | Sync Words</title>
        <meta name="description" content="Sync Wordsの基本的な使い方を解説するページです。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-[#0A192F] font-sans text-[#ccd6f6] antialiased selection:bg-[#64ffda]/20 min-h-screen">
        {/* --- ヘッダー (privacy-policy.tsxと共通) --- */}
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-[#0A192F]/80 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-white hover:text-[#64ffda] transition-colors duration-300">Sync Words</Link>
                        <nav className="flex items-center gap-5">
                            <Link href="/login" className="text-sm font-medium text-[#ccd6f6] hover:text-[#64ffda] transition-colors duration-300">ログイン</Link>
                            <Link href="/signup" className="text-sm font-medium bg-[#64ffda] text-[#0A192F] px-4 py-2 rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300">無料で始める</Link>
                        </nav>
                    </div>
                </header>
        <main className="pt-24">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-full mx-auto">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-10">
                使い方ガイド
              </h1>
              
              <div className="space-y-12 text-[#8892B0] leading-loose">
                
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">1. はじめに</h2>
                  <p>
                    Sync Wordsへようこそ! このガイドでは、Sync Wordsを最大限に活用するための基本的な使い方を解説します。
                    当サービスは、科学的な学習理論に基づいた最適なタイミングで単語を復習できる、あなたのためのスマートな単語帳です。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. 単語の登録</h2>
                  <p>
                    学習の第一歩は、覚えたい単語を登録することから始まります。「単語一覧」ページの上部にあるフォームから、新しい単語とその意味を簡単に追加できます。
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li><strong>一括登録:</strong> 「行を追加」ボタンを使えば、一度に複数の単語を効率的に登録することが可能です。</li>
                    <li><strong>キーボード操作:</strong> Command/Ctrl + Enterで新しい行を追加、Shift + Command/Ctrl + Enterでフォーム全体を保存するなど、便利なショートカットも用意されています。</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. 毎日の復習</h2>
                  <p>
                    ホーム画面では、その日に復習すべき単語が自動で表示されます。表示された単語の意味を思い出し、以下の2ステップで回答してください。
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mt-4 pl-4">
                    <li><strong>意味の確認:</strong> まずは単語だけが表示されます。意味を思い出したら「意味を確認する」ボタン（またはEnterキー）を押してください。</li>
                    <li><strong>自己評価:</strong> 表示された意味が合っていたか、「わかった」「わからない」のボタン（または左右の矢印キー）で評価します。この回答時間と正誤によって、定着度を図り次回復習日が自動で設定されます。</li>
                    <li><strong>測定方法:</strong> 単語が表示されてから、「わかった」「わからない」のボタンを押すまでの時間を測定します。この時間が短いほど、単語の定着度が高いと判断され、次回の復習日は長く設定されます。</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. 単語一覧と管理</h2>
                  <p>
                    「単語一覧」ページでは、これまでに登録したすべての単語を確認できます。
                  </p>
                   <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li><strong>検索:</strong> ページ上部の検索ボックスから、単語や意味で登録済みの単語を瞬時に絞り込めます。</li>
                    <li><strong>編集と削除:</strong> 各単語のチェックボックスを選択することで、単語の情報を編集したり、不要な単語を削除したりできます。</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. 設定</h2>
                  <p>
                    「設定」ページでは、アカウントに関する各種設定を行えます。
                  </p>
                   <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li><strong>パスワード変更:</strong> セキュリティのために定期的なパスワードの変更が可能です。</li>
                    <li><strong>タイムゾーン設定:</strong> あなたのいる地域に合わせたタイムゾーンを設定することで、毎日の復習が適切な日付で区切られるようになります。</li>
                    <li><strong>アカウント削除:</strong> 全てのデータを完全に削除したい場合は、こちらから手続きを行えます。この操作は元に戻せませんのでご注意ください。</li>
                    <li><strong>お問い合わせ:</strong> お問い合わせフォームが用意されています。改善して欲しい点があればこちらからよろしくお願いいたします。</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. 拡張機能</h2>
                  <p>
                    本アプリには専用の拡張機能『Sync Words』が用意されています。ブラウザにインストールすることで、ウェブ上で見つけた単語をその場で保存できるようになります。
                  </p>
                   <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <a href="https://chromewebstore.google.com/detail/sync-words/hbjdbljjbemllpdoemiokimoojlpckkf?hl=ja" className="text-[#64ffda] hover:underline font-normal">インストールはこちらから→</a>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </main>
        
        {/* --- フッター (privacy-policy.tsxと共通) --- */}
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

export default GuidePage;