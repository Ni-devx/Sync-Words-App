// pages/terms-of-service.tsx などのファイル名で保存してください

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

const TermsOfServicePage: NextPage = () => {
  const isMounted = useIsMounted();

  return (
    <>
      <Head>
        <title>利用規約 | Sync Words</title>
        <meta name="description" content="Sync Wordsの利用規約ページです。" />
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
                利用規約
              </h1>
              
              <div className="space-y-10 text-[#8892B0] leading-loose">
                <p>
                  この利用規約（以下、「本規約」）は、Sync Words（以下、「当サービス」）の利用条件を定めるものです。登録ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、当サービスをご利用いただきます。
                </p>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第1条（適用）</h2>
                  <p>
                    本規約は、ユーザーと当サービスとの間の当サービスの利用に関わる一切の関係に適用されるものとします。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第2条（利用登録）</h2>
                  <p>
                    当サービスの利用を希望する者は、本規約に同意の上、当サービスの定める方法によって利用登録を申請し、当サービスがこれを承認することによって、利用登録が完了するものとします。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第3条（ユーザーID及びパスワードの管理）</h2>
                  <ol className="list-decimal list-inside space-y-2 mt-4 pl-4">
                    <li>ユーザーは、自己の責任において、当サービスのユーザーID及びパスワードを適切に管理するものとします。</li>
                    <li>ユーザーは、いかなる場合にも、ユーザーID及びパスワードを第三者に譲渡または貸与することはできません。</li>
                    <li>ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は、当サービスに故意又は重大な過失がある場合を除き、当サービスは一切の責任を負わないものとします。</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第4条（禁止事項）</h2>
                  <p>
                    ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                    <li>当サービスの運営を妨害するおそれのある行為</li>
                    <li>他のユーザーに関する情報を収集または蓄積する行為</li>
                    <li>不正アクセスをし、またはこれを試みる行為</li>
                    <li>当サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                    <li>その他、当サービスが不適切と判断する行為</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第5条（本サービスの提供の停止等）</h2>
                  <p>
                    当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サービスの全部または一部の提供を停止または中断することができるものとします。
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                    <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                    <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                    <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                    <li>その他、当サービスが本サービスの提供が困難と判断した場合</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第6条（著作権）</h2>
                  <p>
                    ユーザーが当サービスに投稿した単語データ等の著作権は、ユーザー自身に留保されるものとします。ただし、当サービスは、サービスの提供・改善に必要な範囲内でこれらを使用できるものとします。当サービス及び当サービスに関連するコンテンツの著作権は、当サービスまたは正当な権利を有する第三者に帰属します。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第7条（免責事項）</h2>
                  <p>
                    当サービスは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。当サービスは、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第8条（利用規約の変更）</h2>
                  <p>
                    当サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、本ウェブサイトに掲載したときから効力を生じるものとします。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">第9条（準拠法・裁判管轄）</h2>
                  <p>
                    本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当サービスの提供者の所在地を管轄する裁判所を専属的合意管轄とします。
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

export default TermsOfServicePage;