// pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';

function Document() {
  return (
    <Html lang="ja"> {/* lang属性などもここで設定できます */}
      <Head>
        {/* ここにfaviconのリンクを記述します */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;