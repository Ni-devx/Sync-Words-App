// pages/privacy-policy.tsx

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

const PrivacyPolicyPage: NextPage = () => {
  const isMounted = useIsMounted();

  return (
    <>
      <Head>
        <title>プライバシーポリシー | Sync Words</title>
        <meta name="description" content="Sync Wordsのプライバシーポリシーページです。" />
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

        <main className="pt-24">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-full mx-auto">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-10">
                プライバシーポリシー
              </h1>
              
              <div className="space-y-10 text-[#8892B0] leading-loose">
                <p>
                  Sync Words（以下、「当サービス」）は、ユーザーの皆様からお預かりする情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」）を定めます。
                </p>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第1条（収集する情報と収集方法）</h2>
                  <p>
                    当サービスは、個人情報保護法に定められる「個人情報」（氏名、生年月日、住所、電話番号、メールアドレスなど、特定の個人を識別できる情報）を収集いたしません。
                  </p>
                  <p className="mt-4">
                    サービスのご利用にあたり、ユーザーから以下の情報（以下、総称して「ユーザー情報」といいます。）をご提供いただきます。個人を直接特定するものではありませんが、慎重に取り扱います。
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li>ユーザーID（ユーザー自身で設定）</li>
                    <li>パスワード（暗号化して安全に保管します）</li>
                    <li>ユーザーが学習のために保存した単語データ</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第2条（ユーザー情報を利用する目的）</h2>
                  <p>
                    当サービスがユーザー情報を利用する目的は、以下のとおりです。
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mt-4 pl-4">
                    <li>ユーザー認証及びサービスの提供・運営のため</li>
                    <li>ユーザーご自身の登録情報（単語データ等）の閲覧・編集機能を可能にするため</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第3条（ユーザー情報の第三者提供）</h2>
                  <p>
                    当サービスは、ユーザー情報について、あらかじめユーザーの同意を得ることなく、第三者に提供することはありません。
                  </p>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第4条（安全管理措置）</h2>
                  <p>
                    当サービスは、ユーザー情報の漏えい、滅失、毀損、及び不正アクセス等を防止するため、以下の安全管理措置を講じています。
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li>パスワードは復元不可能な形式で暗号化して保存します。</li>
                    <li>データベースにはRLSを導入し、ユーザー本人のみが自身のデータにアクセスできるよう制限しています。</li>
                  </ul>

                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第5条（登録情報の開示・削除）</h2>
                  <p>
                    ユーザーは、当サービスにログインすることにより、ご自身で登録した単語データをいつでも閲覧・編集することが可能です。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第6条（プライバシーポリシーの変更）</h2>
                  <p>
                    本ポリシーの内容は、必要に応じて変更されることがあります。重要な変更がある場合には、ウェブサイト上での告知など適切な方法でユーザーにお知らせいたしますが、ユーザーに通知することなく、変更することができるものとします。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
                  </p>
                </section>
                
                <p className="text-right mt-12">
                  制定日: 2025年8月6日
                </p>
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
                        <Link href="/guide" legacyBehavior><a className="hover:text-[#64ffda] transition-colors">使い方ガイド</a></Link>
                        </div>

                    </div>
                    </div>
                </footer>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
