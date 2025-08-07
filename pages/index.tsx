// pages/index.tsx (完全修正版)

import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';

// --- クライアントサイドでのマウント状態を安全に管理するカスタムフック ---
const useIsMounted = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    return isMounted;
};

// --- Intersection Observerを管理するカスタムフック ---
const useInView = (options?: IntersectionObserverInit): [React.RefObject<HTMLDivElement>, boolean] => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.disconnect();
            }
        };
    }, [options]);

    return [ref as React.RefObject<HTMLDivElement>, isInView] as const;
};

// --- 文字を1文字ずつアニメーションさせるコンポーネント (ハイドレーション対策済み) ---
const StaggeredText = ({ text }: { text: string }) => {
    const isMounted = useIsMounted();
    const [ref, isInView] = useInView({ threshold: 0.1 });
    const [startAnimation, setStartAnimation] = useState(false);

    useEffect(() => {
        if (isMounted && isInView) {
            const timer = setTimeout(() => setStartAnimation(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isMounted, isInView]);

    return (
        <span ref={ref} className="inline-block" aria-label={text}>
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className="inline-block transition-all duration-700 ease-in-out"
                    style={{
                        filter: startAnimation ? 'blur(0)' : 'blur(10px)',
                        opacity: startAnimation ? 1 : 0,
                        transitionDelay: `${index * 0.06}s`,
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

// --- アイコン ---
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
);


// --- 画像をオシャレに表示するコンポーネント ---
const ImageVisual = ({ src, alt, shouldAnimate }: { src: string; alt: string; shouldAnimate: boolean }) => {
    return (
        <div className="group relative w-full aspect-video flex items-center justify-center [perspective:1000px]">
            <div
                className={`absolute bottom-0 w-[120%] h-[70%] bg-gradient-to-t from-[#64ffda]/20 via-[#64ffda]/10 to-transparent blur-3xl rounded-full transition-opacity duration-1000 ease-out ${
                    shouldAnimate ? 'opacity-50 delay-500' : 'opacity-0'
                }`}
            />
            <div
                className={`w-[85%] h-auto rounded-xl bg-slate-900/50 p-2 border border-slate-700 backdrop-blur-sm transition-all duration-1000 ease-out ${
                    shouldAnimate ? 'opacity-100 rotate-y-0 scale-100' : 'opacity-0 scale-95 [transform:rotateY(-15deg)]'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={1600}
                    height={900}
                    className="w-full h-auto rounded-lg shadow-2xl shadow-black/50"
                    priority
                />
            </div>
        </div>
    );
};

// --- 問題提起と解決策の提示セクション ---
const PromiseSection = () => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const isMounted = useIsMounted();
    const shouldAnimate = isInView && isMounted;

    return (
        <section ref={ref} className="py-24 md:py-32">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                    <StaggeredText text="なぜ、記憶は薄れるのか？" />
                </h2>
                <p className={`whitespace-pre-line mt-4 max-w-7xl mx-auto text-lg text-[#8892B0] leading-loose transition-all duration-700 ease-out delay-300 ${shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {`エビングハウスの忘却曲線が示すように、私たちの脳は情報を忘れるようにできています。\nしかし、適切なタイミングでの復習が、その流れを劇的に変えます。`}
                </p>
                <div className={`relative mt-16 max-w-4xl mx-auto transition-opacity duration-1000 ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="aspect-[2/1] w-full border-b-2 border-l-2 border-slate-700/50 rounded-bl-lg p-4 flex flex-col justify-end relative">
                        {/* Y軸ラベル（記憶率） */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 -ml-8">
                            <span>100%</span>
                            <span>58%</span>
                            <span>44%</span>
                            <span>34%</span>
                            <span>25%</span>
                            <span>21%</span>
                        </div>
                        
                        {/* X軸ラベル（時間） */}
                        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 -mb-6">
                            <span>20分後</span>
                            <span>1時間後</span>
                            <span>1日後</span>
                            <span>6日後</span>
                            <span>30日後</span>
                        </div>
                        
                        {/* 軸ラベル */}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-slate-500 p-10">学習後の日数</span>
                        <span className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-slate-500 p-10">覚えている割合</span>
                        
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            {/* 忘却曲線（赤） */}
                            <path 
                                d="M 0,10 Q 40,50 80,70 Q 120,85 160,95 Q 200,105 240,115 Q 280,120 320,125 Q 360,130 400,135" 
                                stroke="#f87171" 
                                strokeWidth="3" 
                                fill="none" 
                                vectorEffect="non-scaling-stroke" 
                                className={`transition-all duration-[2000ms] ease-out ${shouldAnimate ? 'animate-draw' : ''}`} 
                                style={{ 
                                    transitionDelay: '500ms',
                                    strokeDasharray: shouldAnimate ? '1000' : '0',
                                    strokeDashoffset: shouldAnimate ? '0' : '1000'
                                }} 
                            />
                            
                            {/* 復習による定着曲線（青） */}
                            <path 
                                d="M 0,10 Q 40,50 80,70 L 80,20 Q 120,45 160,55 L 160,15 Q 200,30 240,40 L 240,15 Q 280,25 320,30 L 320,15 Q 360,20 400,25" 
                                stroke="#64ffda" 
                                strokeWidth="3.5" 
                                fill="none" 
                                vectorEffect="non-scaling-stroke" 
                                className={`transition-all duration-[2500ms] ease-out ${shouldAnimate ? 'animate-draw' : ''}`} 
                                style={{ 
                                    transitionDelay: '1200ms',
                                    strokeDasharray: shouldAnimate ? '1200' : '0',
                                    strokeDashoffset: shouldAnimate ? '0' : '1200'
                                }} 
                            />
                        </svg>
                        
                        {/* 説明テキスト */}
                        <div className={`absolute transition-all duration-700 ease-out ${shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{left: '62%', top: '50%', transitionDelay: '1800ms'}}>
                            <p className="text-sm text-red-400/80">何もしない場合</p>
                        </div>
                        <div className={`absolute transition-all duration-700 ease-out ${shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{left: '62%', top: '18%', transitionDelay: '2500ms'}}>
                            <p className="whitespace-pre-line text-sm text-[#64ffda]">{`復習した場合`}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- 1つの特徴を紹介するフルスクリーンセクションコンポーネント (ハイドレーション対策済み) ---
interface FeatureSectionProps {
    index: number; title: string; description: string;
    linkUrl?: string; linkText?: string;
    imageSrc: string; imageAlt: string;
}
const FeatureSection: React.FC<FeatureSectionProps> = ({ index, title, description, linkUrl, linkText, imageSrc, imageAlt }) => {
    const [ref, isInView] = useInView({ threshold: 0.4 });
    const isMounted = useIsMounted();
    const shouldAnimate = isInView && isMounted;
    const isEven = index % 2 === 0;

    return (
        <section ref={ref} className="relative w-full flex items-center py-20 overflow-hidden">
            <div className={`absolute top-0 w-px h-full bg-gradient-to-b from-[#64ffda]/0 via-[#64ffda]/30 to-[#64ffda]/0 transition-all duration-1000 ease-out ${isEven ? 'left-[10%]' : 'right-[10%]' } ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="container mx-auto px-6">
                <div className={`grid md:grid-cols-2 gap-12 md:gap-24 items-center`}>
                    <div className={isEven ? 'md:order-1' : 'md:order-2'}>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-tight"><StaggeredText text={title} /></h2>
                        <p className={`whitespace-pre-line text-lg text-[#8892B0] leading-relaxed transition-all duration-700 ease-out ${shouldAnimate ? 'delay-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{description}</p>
                        {linkUrl && linkText && (
                            <div className={`mt-6 transition-all duration-700 ease-out ${shouldAnimate ? 'delay-700 opacity-100' : 'opacity-0'}`}>
                                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 font-semibold text-[#64ffda] hover:text-white transition-colors duration-300">
                                    <span>{linkText}</span><ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </a>
                            </div>
                        )}
                    </div>
                    <div className={`relative ${isEven ? 'md:order-2' : 'md:order-1'}`}><ImageVisual src={imageSrc} alt={imageAlt} shouldAnimate={shouldAnimate} /></div>
                </div>
            </div>
        </section>
    );
};

// --- 最終CTAセクション ---
const FinalCtaSection = () => {
    const [ref, isInView] = useInView({ threshold: 0.5 });
    const isMounted = useIsMounted();
    const shouldAnimate = isInView && isMounted;

    return (
        <section ref={ref} className="py-24 md:py-40 bg-slate-900">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-4xl md:text-5xl font-black tracking-wide text-white leading-loose max-w-3xl mx-auto"><StaggeredText text="効率化された単語学習を。" /></h2>
                <div className={`mt-10 transition-all duration-700 ease-out ${shouldAnimate ? 'delay-500 opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <Link href="/signup" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#64ffda] text-[#0A192F] text-xl font-bold rounded-full shadow-[0_5px_30px_-10px_rgba(100,255,218,0.5)] transform hover:scale-105 hover:shadow-[0_8px_40px_-10px_rgba(100,255,218,0.7)] transition-all duration-300 ease-out">
                        今すぐ無料で始める<ArrowRightIcon className="w-7 h-7 transform group-hover:translate-x-1.5 transition-transform duration-300"/>
                    </Link><p className="mt-4 text-sm text-[#8892B0]">メールアドレスは不要です。</p>
                </div>
            </div>
        </section>
    );
};

// --- ページ本体 (ハイドレーション対策済み) ---
const LandingPage: NextPage = () => {
    const isMounted = useIsMounted();

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <title>Sync Words | あなたの脳とシンクロするインテリジェントな単語帳。</title>
                <meta name="description" content="Sync Wordsは、科学的な学習理論に基づいたスマートな単語帳アプリです。出会った単語を、忘れられない知識へと変えましょう。" />
            </Head>
            <div className="bg-[#0A192F] font-sans text-[#ccd6f6] antialiased selection:bg-[#64ffda]/20">
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-[#0A192F]/50 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-white hover:text-[#64ffda] transition-colors duration-300">Sync Words</Link>
                        <nav className="flex items-center gap-5">
                            <Link href="/login" className="text-sm font-medium text-[#ccd6f6] hover:text-[#64ffda] transition-colors duration-300">ログイン</Link>
                            <Link href="/signup" className="text-sm font-medium bg-[#64ffda] text-[#0A192F] px-4 py-2 rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300">無料で始める</Link>
                        </nav>
                    </div>
                </header>
                <main>
                    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 z-0 animate-slow-pulse"><div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(100,255,218,0.1),rgba(255,255,255,0))]"></div></div>
                        <div className={`relative z-10 text-center px-4 transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-normal tracking-wide text-white leading-tight md:leading-tight"><StaggeredText text="Sync Words" /></h1>
                            <p className="whitespace-pre-line mt-6 max-w-7xl mx-auto text-lg md:text-xl text-[#8892B0] leading-relaxed transition-opacity duration-1000 delay-500" style={{opacity: isMounted ? 1 : 0}}>
                                {`あなたの脳とシンクロするインテリジェントな単語帳。`}
                            </p>
                            <div className={`mt-10 transition-all duration-700 delay-700 ease-out ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <Link href="/app" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#64ffda] text-[#0A192F] text-lg font-bold rounded-full shadow-[0_5px_30px_-10px_rgba(100,255,218,0.5)] transform hover:scale-105 hover:shadow-[0_8px_40px_-10px_rgba(100,255,218,0.7)] transition-all duration-300 ease-out">
                                    すぐに始める<ArrowRightIcon className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300"/>
                                </Link>
                            </div>
                        </div>
                    </section>
                    <PromiseSection />
                    <div className="space-y-16 md:space-y-32">
                        <FeatureSection index={0} title="脳と同期する。" description={`単語を思い出す反応速度から記憶の定着度を判定。\nそれに基づく最適化された復習計画により知識を長期記憶へ。`} imageSrc="/feature1.png" imageAlt="AIによる最適な復習タイミングの提示画面" />
                        <FeatureSection index={1} title="没入できる体験。" description={`洗練されたデザインが、学習コンテンツへの集中を加速。\n学習が効率化される没入感のある体験を。`} imageSrc="/feature2.png" imageAlt="没入できる学習モードのUI" />
                        <FeatureSection index={2} title="出会いを逃さない。" description={`Chrome拡張機能が、ブラウザ上のあらゆる単語との出会いを逃さない。\nワンクリックで、無限の語彙を。`} linkText="こちらからインストール" linkUrl="https://chromewebstore.google.com/detail/sync-words/hbjdbljjbemllpdoemiokimoojlpckkf?hl=ja" imageSrc="/feature3.png" imageAlt="ウェブページからワンクリックで単語を登録するChrome拡張機能" />
                    </div>
                    <FinalCtaSection />
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

export default LandingPage;