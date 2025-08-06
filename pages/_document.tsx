// pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';

function Document() {
  return (
    <Html lang="ja"> {/* lang属性などもここで設定できます */}
      <Head>
        {/* ここにfaviconのリンクを記述します */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;