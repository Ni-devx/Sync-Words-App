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
              [あなたのサービス名]（以下、「当サービス」といいます。）は、本ウェブサイト上で提供するサービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第1条（個人情報）</h2>
              <p>
                「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第2条（事業者の名称、住所及び代表者の氏名）</h2>
              <p>
                当サービスを提供する事業者の名称、住所及び代表者の氏名は以下のとおりです。
              </p>
              <ul className="list-none pl-0">
                <li>名称：[事業者の氏名または名称]</li>
                <li>住所：[住所を記載]</li>
                <li>代表者：[代表者の氏名を記載]</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800">第3条（個人情報の収集方法）</h2>
              <p>
                当サービスは、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレスなどの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当サービスの提携先（情報提供元、広告主、広告配信先などを含みます。以下、｢提携先｣といいます。）などから収集することがあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第4条（個人情報を収集・利用する目的）</h2>
              <p>
                当サービスが個人情報を収集・利用する目的は、以下のとおりです。
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>当サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
                <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当サービスが提供する他のサービスの案内のメールを送付するため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                <li>上記の利用目的に付随する目的</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第5条（安全管理措置）</h2>
              <p>
                当サービスは、取り扱う個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第6条（個人情報の第三者提供）</h2>
              <p>
                当サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                <li>予め次の事項を告知あるいは公表し、かつ当サービスが個人情報保護委員会に届出をしたとき
                  <ol className="list-alpha list-inside pl-4 mt-1">
                    <li>利用目的に第三者への提供を含むこと</li>
                    <li>第三者に提供されるデータの項目</li>
                    <li>第三者への提供の手段または方法</li>
                    <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                    <li>本人の求めを受け付ける方法</li>
                  </ol>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第7条（個人情報の開示、訂正及び利用停止等）</h2>
              <p>
                当サービスは、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。なお、個人情報の開示に際しては、1件あたり1,000円の手数料を申し受けます。
              </p>
              <p>
                ユーザーは、当サービスの保有する自己の個人情報が誤った情報である場合には、当サービスが定める手続きにより、個人情報の訂正、追加または削除を請求することができます。
              </p>
              <p>
                ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第8条（Cookieの使用について）</h2>
              <p>
                当サービスでは、Cookie及びこれに類する技術を利用することがあります。これらの技術は、当サービスの利用状況等の把握に役立ち、サービス向上に資するものです。Cookieを無効化されたいユーザーは、ウェブブラウザの設定を変更することによりCookieを無効化することができます。ただし、Cookieを無効化すると、当サービスの一部の機能をご利用いただけなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">第9条（アクセス解析ツールについて）</h2>
              <p>
                当サービスは、サービスの利用状況を把握するため、Google社の提供する「Google Analytics」を利用しています。Google Analyticsは、Cookieを利用して利用者の情報を収集します。収集される情報は匿名であり、個人を特定するものではありません。詳細については、「Googleのサービスを使用するサイトやアプリから収集した情報のGoogleによる使用」のページをご確認ください。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800">第10条（プライバシーポリシーの変更）</h2>
              <p>
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。当サービスが別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800">第11条（お問い合わせ窓口）</h2>
              <p>
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。<br />
                [連絡先のメールアドレス等をここに記載]
              </p>
            </section>

            <p className="text-right">
              制定日: 2025年XX月XX日
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