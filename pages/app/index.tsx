// pages/index.tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

// --- 型定義 ---
interface Word { id: string; user_id: string; word: string; meaning: string; next_review_date: string; created_at: string; }
type Result = { word: Word; correct: boolean; responseTime: number; scheduledDate: string; }
type ReviewState = 'idle' | 'loading' | 'reviewing' | 'results';
const NO_WORDS_TO_REVIEW_MESSAGE = '本日復習する単語はありません。';
const ReviseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

// ★★★ 変更点: ReviewCardコンポーネントを全面的に刷新 ★★★
interface ReviewCardProps {
  word: string;
  meaning: string;
  currentIndex: number;
  totalWords: number;
  onAnswer: (correct: boolean) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ word, meaning, currentIndex, totalWords, onAnswer }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const onAnswerRef = useRef(onAnswer);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  // キーボード操作（Enterで意味を表示、矢印キーで回答）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isRevealed) {
        setIsRevealed(true);
      } else if (isRevealed) {
        if (e.key === 'ArrowRight') {
          onAnswerRef.current(true);
        } else if (e.key === 'ArrowLeft') {
          onAnswerRef.current(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none text-center">
      <p className="mb-4 text-slate-500 font-semibold text-lg">{currentIndex + 1} / {totalWords}</p>
      
      <div className="w-full bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col justify-center items-center p-8 min-h-[320px] transition-all duration-300">
        {/* 単語表示 */}
        <h1 className="text-slate-900 text-5xl font-bold tracking-wide break-all">{word}</h1>

        {/* 意味表示エリア (isRevealedがtrueの時だけ表示) */}
        <div className={`transition-opacity duration-500 mt-4 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
          {isRevealed && <p className="text-slate-600 text-2xl">{meaning}</p>}
        </div>
      </div>
      
      <div className="mt-8 w-full">
        {!isRevealed ? (
          // 意味を確認するボタン
          <>
            <button
              onClick={() => setIsRevealed(true)}
              className="w-full max-w-sm mx-auto bg-blue-600 text-white font-semibold py-4 rounded-lg shadow-sm hover:bg-blue-700 transition-all text-lg"
            >
              意味を確認する
            </button>
            <p className="mt-4 text-slate-500 text-sm">意味を思い出してからボタンを押してください (Enterキー)</p>
          </>
        ) : (
          // わかった / わからない ボタン
          <>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => onAnswer(false)}
                className="w-full bg-slate-200 text-slate-800 font-semibold py-4 rounded-lg hover:bg-slate-300 transition-all"
              >
                わからない (←)
              </button>
              <button
                onClick={() => onAnswer(true)}
                className="w-full bg-emerald-500 text-white font-semibold py-4 rounded-lg hover:bg-emerald-600 transition-all"
              >
                わかった (→)
              </button>
            </div>
             <p className="mt-4 text-slate-500 text-sm">正しく思い出せましたか？</p>
          </>
        )}
      </div>
    </div>
  );
};


export default function HomePage({ setReviewStateForLayout }: { setReviewStateForLayout?: (state: ReviewState) => void }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [reviewState, setReviewState] = useState<ReviewState>('idle');
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const startTimeRef = useRef<number>(0);
  const reviewedIdsRef = useRef<Set<string>>(new Set());
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [revisionIds, setRevisionIds] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (setReviewStateForLayout) {
      setReviewStateForLayout(reviewState);
    }
  }, [reviewState, setReviewStateForLayout]);

  const getLocalDateString = useCallback(() => { return new Date().toLocaleDateString('en-CA'); }, []);
  const formatDate = useCallback((date: Date): string => { return new Date(date).toLocaleDateString('en-CA'); }, []);
  // 反応時間による次回復習日の計算ロジック (変更なし)
  const scheduleNextDate = useCallback((responseTime: number, correct: boolean): string => { const today = new Date(); if (!correct) { const nextDate = new Date(today); nextDate.setDate(today.getDate() + 1); return formatDate(nextDate); } let daysToAdd = 0; if (responseTime < 2000) { daysToAdd = 14; } else if (responseTime < 3000) { daysToAdd = 7; } else if (responseTime < 4000) { daysToAdd = 3; } else { daysToAdd = 1; } const nextDate = new Date(today); nextDate.setDate(today.getDate() + daysToAdd); return formatDate(nextDate); }, [formatDate]);
  
  const fetchUser = useCallback(async () => { try { const res = await fetch('/api/auth/me', { credentials: 'include' }); if (!res.ok) throw new Error("Authentication failed"); const json = await res.json(); setUserId(json.user.userId); setDisplayName(json.user.displayName);} catch { router.push('/login'); } finally { setPageLoading(false); } }, [router]);
  const fetchReviewCount = useCallback(async () => { if (!userId) return; setCountLoading(true); try { const today = getLocalDateString(); const res = await fetch(`/api/words/count?date=${today}`, { credentials: 'include' }); if (!res.ok) { const errorData = await res.json().catch(() => null); throw new Error(errorData?.message || `サーバーエラーが発生しました (ステータス: ${res.status})`); } const { count } = await res.json(); setReviewCount(count); setMessage(''); } catch (err: any) { console.error(err); setMessage(`復習単語数の取得に失敗しました。: ${err.message}`); setReviewCount(0); } setCountLoading(false); }, [userId, getLocalDateString]);
  
  useEffect(() => { fetchUser() }, [fetchUser]);
  useEffect(() => { if (userId) fetchReviewCount() }, [userId, fetchReviewCount]);
  useEffect(() => { const handleRouteChange = (url: string) => { if (url === '/app') { fetchReviewCount(); } }; router.events.on('routeChangeComplete', handleRouteChange); return () => { router.events.off('routeChangeComplete', handleRouteChange); }; }, [router.events, fetchReviewCount]);
  
  const startReview = async () => { if (!userId) return; setReviewState('loading'); setMessage(''); try { const today = getLocalDateString(); const res = await fetch(`/api/words/review?date=${today}`, { credentials: 'include' }); if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || '単語の取得に失敗しました'); } const data: Word[] = await res.json(); if (data.length === 0) { setMessage(NO_WORDS_TO_REVIEW_MESSAGE); setReviewState('idle'); } else { setWords(data); setIndex(0); setResults([]); reviewedIdsRef.current = new Set(); startTimeRef.current = performance.now(); setReviewState('reviewing'); } } catch (err: any) { console.error(err); setMessage(err.message || '単語の取得に失敗しました。'); setReviewState('idle'); } };
  
  const handleAnswer = useCallback(async (correct: boolean) => {
    // 単語が表示されてから回答ボタンが押されるまでの時間を計測
    const responseTime = performance.now() - startTimeRef.current;
    
    if (!words[index]) return;
    const word = words[index];
    const nextDate = scheduleNextDate(responseTime, correct);
    
    setResults(prev => [...prev, { word, correct, responseTime, scheduledDate: nextDate }]);
    reviewedIdsRef.current.add(word.id);
    
    try {
      await fetch('/api/words/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: word.id, next_review_date: nextDate }) });
    } catch (err) {
      console.error('更新失敗:', err);
    }
    
    // 次の未レビュー単語を探す
    const nextUnreviewedIndex = words.findIndex((w, i) => i > index && !reviewedIdsRef.current.has(w.id));
    if (nextUnreviewedIndex !== -1) {
      setIndex(nextUnreviewedIndex);
      startTimeRef.current = performance.now(); // 次の単語の計測を開始
    } else {
      // 最後まで行った場合、結果表示へ
      setReviewState('results');
    }
  }, [index, scheduleNextDate, words]);

  useEffect(() => { if (selectAllCheckboxRef.current) { const correctResults = results.filter(r => r.correct); const numSelected = revisionIds.size; const numTotal = correctResults.length; selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numTotal; } }, [revisionIds, results]);
  const handleSelectForRevision = (wordId: string) => { setRevisionIds(prev => { const newSet = new Set(prev); if (newSet.has(wordId)) { newSet.delete(wordId); } else { newSet.add(wordId); } return newSet; }); };
  const handleSelectAllForRevision = (e: React.ChangeEvent<HTMLInputElement>) => { const correctWordIds = results.filter(r => r.correct).map(r => r.word.id); if (e.target.checked) { setRevisionIds(new Set(correctWordIds)); } else { setRevisionIds(new Set()); } };
  const handleBulkRevision = async () => { if (revisionIds.size === 0) return; const newResults = results.map(result => { if (revisionIds.has(result.word.id)) { const newNextDate = scheduleNextDate(0, false); return { ...result, correct: false, scheduledDate: newNextDate }; } return result; }); setResults(newResults); const updatePromises = Array.from(revisionIds).map(wordId => { const newNextDate = scheduleNextDate(0, false); return fetch('/api/words/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: wordId, next_review_date: newNextDate }) }); }); try { await Promise.all(updatePromises); } catch (err) { console.error('一括理解度修正に失敗:', err); } setRevisionIds(new Set()); };
  
  if (pageLoading) { return (<div className="flex items-center justify-center min-h-screen"><p className="text-slate-500">読み込み中...</p></div>) }
  
  const correctResults = results.filter(r => r.correct);
  const incorrectResults = results.filter(r => !r.correct);
  
  return (
    <div className="w-full flex justify-center items-center p-4">
      {reviewState === 'idle' && (
        <div className="h-[90vh] max-h-screen min-w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">こんにちは、{displayName || userId} さん</h2>
          {countLoading ? (<div className="animate-pulse text-slate-600">今日の復習単語数を読み込み中...</div>) : (<><p className="text-lg text-slate-600">本日復習する単語は</p><p className="text-7xl font-bold text-gray-600 my-4">{reviewCount}</p><p className="text-lg text-slate-600">語です</p></>)}
          {message && <p className="mt-4 text-yellow-800 bg-yellow-100 p-3 rounded-lg text-sm">{message}</p>}
          <button onClick={startReview} disabled={countLoading || !(reviewCount && reviewCount > 0)} className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">復習を始める</button>
        </div>
      )}

      {reviewState === 'loading' && (<div className="text-center p-8"><p className="text-slate-500">単語を読み込み中…</p></div>)}

      {reviewState === 'reviewing' && words.length > 0 && words[index] && (
        <ReviewCard
          key={words[index].id}
          word={words[index].word}
          meaning={words[index].meaning}
          currentIndex={reviewedIdsRef.current.size}
          totalWords={words.length}
          onAnswer={handleAnswer}
        />
      )}

      {reviewState === 'results' && (
        <div className="space-y-8 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-800">復習結果</h2>
          {incorrectResults.length > 0 && (<div className="bg-white rounded-xl shadow-md border border-slate-200"><div className="p-6"><h3 className="text-xl font-semibold text-slate-800">要復習の単語 ({incorrectResults.length}語)</h3></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left font-semibold text-slate-600">単語</th><th className="px-6 py-3 text-left font-semibold text-slate-600">意味</th><th className="px-6 py-3 text-left font-semibold text-slate-600">次回復習日</th></tr></thead><tbody className="divide-y divide-slate-200">{incorrectResults.map((r, i) => (<tr key={`incorrect-${i}`} className="bg-red-50/50"><td className="px-6 py-4 font-medium text-slate-900">{r.word.word}</td><td className="px-6 py-4 text-slate-700">{r.word.meaning}</td><td className="px-6 py-4 text-slate-500">{r.scheduledDate}</td></tr>))}</tbody></table></div></div>)}
          {correctResults.length > 0 && (<div className="bg-white rounded-xl shadow-md border border-slate-200"><div className="p-6"><h3 className="text-xl font-semibold text-slate-800">覚えている単語 ({correctResults.length}語)</h3><p className="text-sm text-slate-600 mt-2">もし間違えて「わかった」を押してしまった単語があれば、チェックを入れて修正してください。</p></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-4 w-12 text-center"><input type="checkbox" ref={selectAllCheckboxRef} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" onChange={handleSelectAllForRevision} checked={correctResults.length > 0 && revisionIds.size === correctResults.length}/></th><th className="px-6 py-3 text-left font-semibold text-slate-600">単語</th><th className="px-6 py-3 text-left font-semibold text-slate-600">意味</th><th className="px-6 py-3 text-left font-semibold text-slate-600">次回復習日</th></tr></thead><tbody className="divide-y divide-slate-200">{correctResults.map((r) => (<tr key={`correct-${r.word.id}`} className={`transition-colors ${revisionIds.has(r.word.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}><td className="p-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={revisionIds.has(r.word.id)} onChange={() => handleSelectForRevision(r.word.id)}/></td><td className="px-6 py-4 font-medium text-slate-900">{r.word.word}</td><td className="px-6 py-4 text-slate-700">{r.word.meaning}</td><td className="px-6 py-4 text-slate-500">{r.scheduledDate}</td></tr>))}</tbody></table></div></div>)}
          <div className="text-center pt-4 pb-8"><button onClick={() => { setReviewState('idle'); setMessage(''); setRevisionIds(new Set()); fetchReviewCount(); }} className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition">ホームに戻る</button></div>
        </div>
      )}

      <div className={`fixed bottom-0 left-0 md:left-64 right-0 p-4 transition-transform duration-300 ${revisionIds.size > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">{revisionIds.size}語 選択中</span>
              <button onClick={handleBulkRevision} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition shadow-sm"><ReviseIcon /> 選択を「要復習」に修正</button>
          </div>
      </div>
    </div>
  );
}