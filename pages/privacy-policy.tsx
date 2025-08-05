// pages/privacy-policy.tsx

import React from 'react';
import Link from 'next/link';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
            プライバシーポリシー
          </h1>
          
          <div className="space-y-8 text-gray-700 prose lg:prose-lg">
            
            <p>
              Sync Words（以下、「当サービス」といいます。）は、ユーザーの皆様からお預かりする情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第1条（収集する情報と収集方法）</h2>
              <p>
                当サービスは、個人情報保護法に定められる「個人情報」（氏名、生年月日、住所、電話番号、メールアドレスなど、特定の個人を識別できる情報）を収集いたしません。
              </p>
              <p>
                サービスのご利用にあたり、ユーザーから以下の情報（以下、総称して「ユーザー情報」といいます。）をご提供いただきます。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>ユーザーID（ユーザー自身で設定）</li>
                <li>パスワード（暗号化して安全に保管します）</li>
                <li>ユーザーが学習のために保存した単語データ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第2条（ユーザー情報を利用する目的）</h2>
              <p>
                当サービスがユーザー情報を利用する目的は、以下のとおりです。
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>ユーザー認証及びサービスの提供・運営のため</li>
                <li>ユーザーご自身の登録情報（単語データ等）の閲覧・編集機能を可能にするため</li>
                <li>上記の利用目的に付随する目的</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第3条（ユーザー情報の第三者提供）</h2>
              <p>
                当サービスは、ユーザー情報について、あらかじめユーザーの同意を得ることなく、第三者に提供することはありません。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800">第4条（安全管理措置）</h2>
              <p>
                当サービスは、お預かりしたユーザー情報の漏えい、滅失またはき損の防止、その他のユーザー情報の安全管理のために必要かつ適切な措置を講じます。特に、パスワードは復元不可能な形式に暗号化した上で保存します。また、Supabaseのデータベースに保存されるユーザー情報は、適切なアクセス制御を行い、外部からの不正アクセスを防止します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第5条（登録情報の開示・削除）</h2>
              <p>
                ユーザーは、当サービスにログインすることにより、ご自身で登録した単語データ等をいつでも閲覧・編集することが可能です。
              </p>
            </section>
            

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第7条（プライバシーポリシーの変更）</h2>
              <p>
                本ポリシーの内容は、ユーザーに通知することなく、変更することができるものとします。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第8条（事業者の表示）</h2>
              <p>
                事業者の名称：[事業者の氏名または名称]
                <br />
                住所：[住所を記載]
                <br />
                代表者：[代表者の氏名を記載]
              </p>
            </section>
            
            <p className="text-right">
              制定日: 2025年8月6日
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center">
            <Link href="/" legacyBehavior>
              <a className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                トップページに戻る
              </a>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;