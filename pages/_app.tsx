// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../components/Layout';
import '../styles/globals.css';

// HomePageコンポーネントが渡すStateの型を定義
type ReviewState = 'idle' | 'loading' | 'reviewing' | 'results';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // ★★★ 改善点 1: HomePageの状態を_app.tsxで管理 ★★★
  const [reviewState, setReviewState] = useState<ReviewState>('idle');

  const noLayoutPaths = ['/login', '/signup', '/'];
  const shouldApplyLayout = !noLayoutPaths.includes(router.pathname);

  // HomePageの場合のみ、stateをLayoutとComponentに渡す
  // Component.name を使って現在のページコンポーネントを判定
  const isHomePage = Component.name === 'HomePage';

  return (
    <>
      <Head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <title>Sync Words</title>
        <meta name="description" content="Sync Wordsは、科学的な学習理論に基づいたスマートな単語帳アプリです。出会った単語を、忘れられない知識へと変えましょう。" />

      </Head>
      {shouldApplyLayout ? (
        <Layout reviewState={isHomePage ? reviewState : undefined}>
          <Component
            {...pageProps}
            // HomePageにだけsetReviewState関数を渡す
            setReviewStateForLayout={isHomePage ? setReviewState : undefined}
          />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default MyApp;
