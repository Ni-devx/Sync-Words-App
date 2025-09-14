// pages/index.tsx (ご要望を反映した最終修正版)

import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

// --- カスタムフック (クライアントマウント & 表示領域監視) ---
const useIsMounted = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);
    return isMounted;
};

const useInView = <T extends HTMLElement>(options?: IntersectionObserverInit): [React.RefObject<T>, boolean] => {
    const ref = useRef<T>(null);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
            }
        }, options);
        const currentRef = ref.current;
        if (currentRef) { observer.observe(currentRef); }
        return () => { if (currentRef) { observer.disconnect(); } };
    }, [options]);
    return [ref, isInView];
};

// --- 共通コンポーネント ---
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

// ★★★ 修正点: baseDelay propを追加し、アニメーションの遅延を引き継げるように修正 ★★★
const StaggeredText = ({ text, baseDelay = 0 }: { text: string, baseDelay?: number }) => {
    const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.1 });
    const [startAnimation, setStartAnimation] = useState(false);
    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setStartAnimation(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isInView]);
    return (
        <span ref={ref} className="inline-block" aria-label={text}>
            {text.split('').map((char, index) => (
                <span key={index} className="inline-block transition-all duration-700 ease-in-out" style={{ 
                    filter: startAnimation ? 'blur(0)' : 'blur(10px)', 
                    opacity: startAnimation ? 1 : 0, 
                    transitionDelay: `${baseDelay + (index * 0.05)}s` 
                }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};


// --- 1. ヒーローセクション (ファーストインパクト) ---
const HeroSection = () => {
    const isMounted = useIsMounted();
    // ★★★ 修正点: 改行のためにテキストを分割 ★★★
    const line1 = "Intelligent Vocab. List";
    const line2 = "that Works for You";

    return (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden text-center">
            <div className="absolute inset-0 z-0 animate-slow-pulse"><div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(100,255,218,0.1),rgba(255,255,255,0))]"></div></div>
            <div suppressHydrationWarning className={`relative z-10 px-4 transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                {/* ★★★ 修正点: h1のフォントはfont-black(ゴシック系の極太)を適用。2行に分けて連続アニメーションするように修正 ★★★ */}
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-white leading-tight md:leading-tight">
                    <span className="block"><StaggeredText text={line1} /></span>
                    <span className="block"><StaggeredText text={line2} baseDelay={line1.length * 0.05} /></span>
                </h1>
                <p suppressHydrationWarning className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#8892B0] leading-relaxed transition-opacity duration-1000 delay-500" style={{opacity: isMounted ? 1 : 0}}>
                    Sync Wordsは、忘却曲線に基づいた復習機能を持つ、自由に単語を保存できるスマートな単語帳です。
                </p>
                <div suppressHydrationWarning className={`mt-10 transition-all duration-700 delay-700 ease-out ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <Link href="/signup" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#64ffda] text-[#0A192F] text-lg font-bold rounded-full shadow-[0_5px_30px_-10px_rgba(100,255,218,0.5)] transform hover:scale-105 hover:shadow-[0_8px_40px_-10px_rgba(100,255,218,0.7)] transition-all duration-300 ease-out">
                        無料で始める
                        <ArrowRightIcon className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300"/>
                    </Link>
                    <p className="mt-4 text-sm text-[#8892B0]">メールアドレス不要。数秒で開始できます。</p>
                </div>
            </div>
        </section>
    );
};

// --- 2. 忘却曲線セクション ---
const ForgettingCurveSection = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.3 });
    const isMounted = useIsMounted();
    const shouldAnimate = isInView && isMounted;

    return (
        <section ref={ref} className="py-24 md:py-32">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                    {/* 左側: グラフ */}
                    <div className={`relative transition-opacity duration-1000 ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="aspect-[2/1] w-full border-b-2 border-l-2 border-slate-700/50 rounded-bl-lg p-4 flex flex-col justify-end relative">
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 -ml-8">
                                <span>100%</span><span>58%</span><span>44%</span><span>34%</span><span>25%</span><span>21%</span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 -mb-6">
                                <span>20分後</span><span>1時間後</span><span>1日後</span><span>6日後</span><span>30日後</span>
                            </div>
                            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm text-slate-500">学習後の日数</span>
                            <span className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-slate-500">記憶の定着率</span>
                            
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                                <path d="M 0,10 Q 40,50 80,70 Q 120,85 160,95 Q 200,105 240,115 Q 280,120 320,125 Q 360,130 400,135" stroke="#f87171" strokeWidth="3" fill="none" className={`transition-all duration-[2000ms] ease-out ${shouldAnimate ? 'animate-draw' : ''}`} style={{ transitionDelay: '500ms', strokeDasharray: 1000, strokeDashoffset: shouldAnimate ? 0 : 1000 }} />
                                <path d="M 0,10 Q 40,50 80,70 L 80,20 Q 120,45 160,55 L 160,15 Q 200,30 240,40 L 240,15 Q 280,25 320,30 L 320,15 Q 360,20 400,25" stroke="#64ffda" strokeWidth="3.5" fill="none" className={`transition-all duration-[2500ms] ease-out ${shouldAnimate ? 'animate-draw' : ''}`} style={{ transitionDelay: '1200ms', strokeDasharray: 1200, strokeDashoffset: shouldAnimate ? 0 : 1200 }} />
                            </svg>
                            
                            <div className={`absolute transition-all duration-700 ease-out ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`} style={{left: '62%', top: '50%', transitionDelay: '1800ms'}}><p className="text-sm text-red-400/80">何もしない場合</p></div>
                            <div className={`absolute transition-all duration-700 ease-out ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`} style={{left: '62%', top: '18%', transitionDelay: '2500ms'}}><p className="text-sm text-[#64ffda]">復習した場合</p></div>
                        </div>
                    </div>
                    {/* 右側: テキスト */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                            <StaggeredText text="なぜ、記憶は薄れるのか？" />
                        </h2>
                        <p className={`whitespace-pre-line mt-6 text-lg text-[#8892B0] leading-loose transition-all duration-700 ease-out delay-300 ${shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {`エビングハウスの忘却曲線が示すように、私たちの脳は情報を自然に忘れるようにできています。
しかし、Sync Wordsが適切なタイミングでの復習を促すことで、その流れを劇的に変え、知識を長期的な記憶へと定着させます。`}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- 3. 特徴紹介セクション ---
const FeatureCard: React.FC<{ title: string; description: string; imageSrc: string; imageAlt: string; delay: number; isInView: boolean; }> = ({ title, description, imageSrc, imageAlt, delay, isInView }) => {
    return (
        <div className={`flex flex-col gap-4 transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms`}}>
            {/* ★★★ 修正点: 画像コンテナのサイズを統一 ★★★ */}
            <div className="w-full aspect-video rounded-lg bg-slate-900/50 p-1 border border-slate-700 backdrop-blur-sm overflow-hidden">
                {/* ★★★ 修正点: object-coverで画像をコンテナに合わせてトリミングし、高さを揃える ★★★ */}
                <Image src={imageSrc} alt={imageAlt} width={800} height={450} className="w-full h-full object-cover rounded-md shadow-lg shadow-black/30" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-[#8892B0] leading-relaxed">{description}</p>
        </div>
    );
}
const FeaturesSection = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.2 });
    const features = [
        { title: "脳と同期する", description: "単語を思い出す反応速度から記憶の定着度を判定。科学的根拠に基づき、あなたに最適化された復習計画を自動で生成します。", imageSrc: "/feature1.png", imageAlt: "AIによる最適な復習タイミングの提示画面" },
        { title: "没入できる体験", description: "思考を妨げない、洗練されたインターフェース。学習コンテンツへの集中を加速させ、効率的な知識の習得をサポートします。", imageSrc: "/feature2.png", imageAlt: "没入できる学習モードのUI" },
        { title: "出会いを逃さない", description: "Chrome拡張機能が、ブラウザ上のあらゆる単語との出会いを逃しません。ワンクリックで、あなたの語彙は無限に広がります。", imageSrc: "/feature3.png", imageAlt: "ウェブページから単語を登録するChrome拡張機能" },
    ];
    return(
        <section ref={ref} className="py-24">
            <div className="container mx-auto px-6">
                 <h2 className="text-center text-4xl md:text-5xl font-black tracking-tighter text-white mb-16">
                    <StaggeredText text="学習を、最高効率に。" />
                </h2>
                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} {...feature} delay={i * 200} isInView={isInView}/>
                    ))}
                </div>
            </div>
        </section>
    );
};


// --- 4. 利用者の声 (Testimonials) セクション ---
const TestimonialCard: React.FC<{ quote: string; name: string; title: string; delay: number; isInView: boolean; }> = ({ quote, name, title, delay, isInView }) => {
    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-6 transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: `${delay}ms`}}>
            <p className="text-[#ccd6f6]">"{quote}"</p>
            <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"></div>
                <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-sm text-[#8892B0]">{title}</p>
                </div>
            </div>
        </div>
    );
}
const TestimonialsSection = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
    const testimonials = [
        { quote: "webブラウザ上であれば、単語を打ち込まなくとも、選択するだけで登録できる機能が使いやすく、ストレスが少なかった。", name: "", title: "高校生" },
        { quote: "自分で復習する単語を決めるのは大変だから、自動で出してくれるのはとても嬉しい。日々の学習意欲につながった！", name: "", title: "高校生" },
        { quote: "アプリのデザインがシンプルだったことが学習に適していて使い続けたくなりました。", name: "", title: "中学生" },
    ];
    return (
        <section ref={ref} className="py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-center text-4xl md:text-5xl font-black tracking-tighter text-white mb-12"> <StaggeredText text="ユーザーの声" /> </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => ( <TestimonialCard key={i} {...t} delay={i * 200} isInView={isInView} /> ))}
                </div>
            </div>
        </section>
    );
}

// --- 5. よくある質問 (FAQ) セクション ---
const FaqItem: React.FC<{ question: string; answer: string; }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-6">
                <span className="text-lg font-semibold text-white">{question}</span>
                <ChevronDown className={`w-5 h-5 text-[#64ffda] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="pb-6 text-[#8892B0] leading-relaxed">{answer}</p>
                </div>
            </div>
        </div>
    );
}
const FaqSection = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
    const faqs = [
        { question: "料金はかかりますか？", answer: "いいえ、Sync Wordsのすべての基本機能は完全に無料でご利用いただけます。メールアドレスの登録も不要で、すぐに学習を始めることができます。" },
        { question: "どのデバイスで利用できますか？", answer: "ウェブブラウザが利用できるすべてのデバイス（PC、スマートフォン、タブレット）で快適にご利用いただけます。また、PC向けのChrome拡張機能も提供しており、よりシームレスな単語登録が可能です。" },
        { question: "登録できる単語数に上限はありますか？", answer: "現在、登録できる単語数に上限はありません。あなたの学習意欲の限り、無限に単語をストックし、知識を広げることができます。" },
    ];
    return (
        <section ref={ref} className={`py-24 transition-opacity duration-700 ${isInView ? 'opacity-100' : 'opacity-0'}`}>
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-center text-4xl md:text-5xl font-black tracking-tighter text-white mb-12"> <StaggeredText text="よくある質問" /> </h2>
                <div className="space-y-2">
                    {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
                </div>
                <div className="mt-12 text-center">
                    <p className="text-[#8892B0]">その他のご質問や詳しい使い方については、<br className="sm:hidden" />使い方ガイドをご覧ください。</p>
                    <Link href="/guide" className="group mt-4 inline-flex items-center gap-2 font-semibold text-[#64ffda] hover:text-white transition-colors duration-300">
                        <span>使い方ガイドを見る</span>
                        <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}


// --- 6. 最終CTAセクション ---
const FinalCtaSection = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.5 });
    return (
        <section ref={ref} className="py-24 md:py-32 bg-slate-900/70">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-4xl md:text-5xl font-black tracking-wide text-white leading-loose max-w-3xl mx-auto"><StaggeredText text="効率化された学習体験を。" /></h2>
                <div className={`mt-10 transition-all duration-700 ease-out ${isInView ? 'delay-300 opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <Link href="/signup" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#64ffda] text-[#0A192F] text-xl font-bold rounded-full shadow-[0_5px_30px_-10px_rgba(100,255,218,0.5)] transform hover:scale-105 hover:shadow-[0_8px_40px_-10px_rgba(100,255,218,0.7)] transition-all duration-300 ease-out">
                        今すぐ無料で始める
                    </Link>
                </div>
            </div>
        </section>
    );
};


// --- ページ本体 ---
const LandingPage: NextPage = () => {
    const isMounted = useIsMounted();
    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <title>Sync Words | Intelligent Vocab. List that Works for You</title>
                <meta name="description" content="Sync Wordsは、科学的な学習理論に基づき、あなたの脳が最も忘れにくいタイミングで復習を促す、インテリジェントな単語帳です。" />
                <style>{`
                    .animate-draw {
                        animation: draw-line 2.5s ease-out forwards;
                    }
                    @keyframes draw-line {
                        from { stroke-dashoffset: 1200; }
                        to { stroke-dashoffset: 0; }
                    }
                `}</style>
            </Head>
            <div className="bg-[#0A192F] font-sans text-[#ccd6f6] antialiased selection:bg-[#64ffda]/20">
                {/* 7. ヘッダー */}
                <header suppressHydrationWarning className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-[#0A192F]/80 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-white hover:text-[#64ffda] transition-colors duration-300">Sync Words</Link>
                        <nav className="flex items-center gap-5">
                            <Link href="/login" className="text-sm font-medium text-[#ccd6f6] hover:text-[#64ffda] transition-colors duration-300">ログイン</Link>
                            <Link href="/signup" className="text-sm font-medium bg-[#64ffda] text-[#0A192F] px-4 py-2 rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300">無料で始める</Link>
                        </nav>
                    </div>
                </header>

                <main>
                    <HeroSection />
                    <ForgettingCurveSection />
                    <FeaturesSection />
                    <TestimonialsSection />
                    <FaqSection />
                    <FinalCtaSection />
                </main>

                {/* 8. フッター */}
                <footer className="bg-slate-900/70 border-t border-slate-800">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="text-center md:text-left">
                                <Link href="/" className="text-2xl font-semibold text-white">Sync Words</Link>
                                <p className="text-sm text-[#8892B0] mt-2">© <span suppressHydrationWarning>{new Date().getFullYear()}</span> Sync Words. All rights reserved.</p>
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

export default LandingPage;
