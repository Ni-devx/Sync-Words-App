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

// --- ReviewCardコンポーネント ---
interface ReviewCardProps { word: string; currentIndex: number; totalWords: number; onAnswer: (correct: boolean) => void; }
const ReviewCard: React.FC<ReviewCardProps> = ({ word, currentIndex, totalWords, onAnswer }) => {
  const [position, setPosition] = useState({ x: 0 }); const [opacity, setOpacity] = useState(0); const [isDragging, setIsDragging] = useState(false); const [isAnimating, setIsAnimating] = useState(false); const [transitionDuration, setTransitionDuration] = useState('0.2s'); const cardRef = useRef<HTMLDivElement>(null); const startX = useRef(0); const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);
  useEffect(() => { const fadeInTimer = setTimeout(() => setOpacity(1), 50); const transitionSwitchTimer = setTimeout(() => { setTransitionDuration('0.6s'); }, 250); return () => { clearTimeout(fadeInTimer); clearTimeout(transitionSwitchTimer); }; }, []);
  const triggerAnswer = useCallback((correct: boolean) => { if (isAnimating) return; setIsAnimating(true); const flyOutX = correct ? 250 : -250; setPosition({ x: flyOutX }); setOpacity(0); setTimeout(() => { onAnswerRef.current(correct); }, 600); }, [isAnimating]);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { if (isAnimating) return; setIsDragging(true); startX.current = e.clientX - position.x; if(cardRef.current) { cardRef.current.style.cursor = 'grabbing'; } };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { if (isDragging && !isAnimating) { setPosition({ x: e.clientX - startX.current }); } };
  const handleMouseUpOrLeave = () => { if (!isDragging || isAnimating) return; setIsDragging(false); if(cardRef.current) { cardRef.current.style.cursor = 'grab'; } const threshold = 100; if (position.x < -threshold) { triggerAnswer(false); } else if (position.x > threshold) { triggerAnswer(true); } else { setPosition({ x: 0 }); } };
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') triggerAnswer(false); else if (e.key === 'ArrowRight') triggerAnswer(true); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [triggerAnswer]);
  const rotation = position.x / 15; const leftOpacity = position.x < 0 ? Math.min(Math.abs(position.x) / 100, 1) : 0; const rightOpacity = position.x > 0 ? Math.min(position.x / 100, 1) : 0;
  return (<div className="max-w-7xl mx-auto flex flex-col items-center select-none"><p className="mb-4 text-slate-500 font-semibold text-lg">{currentIndex + 1} / {totalWords}</p><div ref={cardRef} className="w-full bg-gradient-to-r from-gray-200 to-blue-200 rounded-xl shadow-xl border border-slate-200 p-12 relative cursor-grab" style={{transform: `translateX(${position.x}px) rotate(${rotation}deg)`, opacity: opacity, transition: isDragging ? 'none' : `transform ${transitionDuration} ease-out, opacity ${transitionDuration} ease-out`}} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOrLeave} onMouseLeave={handleMouseUpOrLeave}><p className="text-black text-5xl font-bold tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{word}</p><div className="absolute inset-0 bg-gray-200 rounded-xl flex items-center justify-center pointer-events-none" style={{ opacity: leftOpacity, transition: 'opacity 0.2s' }}><div className="text-center text-black"><p className="text-xl font-semibold mt-2">分からない</p></div></div><div className="absolute inset-0 bg-blue-200 rounded-xl flex items-center justify-center pointer-events-none" style={{ opacity: rightOpacity, transition: 'opacity 0.2s' }}><div className="text-center text-black"><p className="text-xl font-semibold mt-2">覚えている</p></div></div></div><p className="mt-8 text-slate-500 text-center">ドラッグ / 矢印キーで回答</p></div>);
};

// ★★★ 改善点: _app.tsxからsetReviewStateForLayoutを受け取る ★★★
export default function HomePage({ setReviewStateForLayout }: { setReviewStateForLayout?: (state: ReviewState) => void }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
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
  
  // ★★★ 改善点: reviewStateが変わるたびにLayoutに通知する ★★★
  useEffect(() => {
    if (setReviewStateForLayout) {
      setReviewStateForLayout(reviewState);
    }
  }, [reviewState, setReviewStateForLayout]);

  const getLocalDateString = useCallback(() => { return new Date().toLocaleDateString('en-CA'); }, []);
  const formatDate = useCallback((date: Date): string => { return new Date(date).toLocaleDateString('en-CA'); }, []);
  const scheduleNextDate = useCallback((responseTime: number, correct: boolean): string => { const today = new Date(); if (!correct) { const nextDate = new Date(today); nextDate.setDate(today.getDate() + 1); return formatDate(nextDate); } let daysToAdd = 0; if (responseTime < 2000) { daysToAdd = 14; } else if (responseTime < 3000) { daysToAdd = 7; } else if (responseTime < 4000) { daysToAdd = 3; } else { daysToAdd = 1; } const nextDate = new Date(today); nextDate.setDate(today.getDate() + daysToAdd); return formatDate(nextDate); }, [formatDate]);
  const fetchUserId = useCallback(async () => { try { const res = await fetch('/api/auth/me', { credentials: 'include' }); if (!res.ok) throw new Error("Authentication failed"); const json = await res.json(); setUserId(json.user.userId); } catch { router.push('/login'); } finally { setPageLoading(false); } }, [router]);
  const fetchReviewCount = useCallback(async () => { if (!userId) return; setCountLoading(true); try { const today = getLocalDateString(); const res = await fetch(`/api/words/count?date=${today}`, { credentials: 'include' }); if (!res.ok) throw new Error(); const { count } = await res.json(); setReviewCount(count); setMessage(''); } catch (err) { console.error(err); setMessage('復習単語数の取得に失敗しました。'); setReviewCount(0); } setCountLoading(false); }, [userId, getLocalDateString]);
  useEffect(() => { fetchUserId() }, [fetchUserId]);
  useEffect(() => { if (userId) fetchReviewCount() }, [userId, fetchReviewCount]);
  useEffect(() => { const handleRouteChange = (url: string) => { if (url === '/app') { fetchReviewCount(); } }; router.events.on('routeChangeComplete', handleRouteChange); return () => { router.events.off('routeChangeComplete', handleRouteChange); }; }, [router.events, fetchReviewCount]);
  const startReview = async () => { if (!userId) return; setReviewState('loading'); setMessage(''); try { const today = getLocalDateString(); const res = await fetch(`/api/words/review?date=${today}`, { credentials: 'include' }); if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || '単語の取得に失敗しました'); } const data: Word[] = await res.json(); if (data.length === 0) { setMessage(NO_WORDS_TO_REVIEW_MESSAGE); setReviewState('idle'); } else { setWords(data); setIndex(0); setResults([]); reviewedIdsRef.current = new Set(); startTimeRef.current = performance.now(); setReviewState('reviewing'); } } catch (err: any) { console.error(err); setMessage(err.message || '単語の取得に失敗しました。'); setReviewState('idle'); } };
  const handleAnswer = useCallback(async (correct: boolean) => { const now = performance.now(); const responseTime = now - startTimeRef.current; if (!words[index]) return; const word = words[index]; const nextDate = scheduleNextDate(responseTime, correct); setResults(prev => [...prev, { word, correct, responseTime, scheduledDate: nextDate }]); reviewedIdsRef.current.add(word.id); try { await fetch('/api/words/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: word.id, next_review_date: nextDate }) }); } catch (err) { console.error('更新失敗:', err); } const nextIdx = words.findIndex((w, i) => i > index && !reviewedIdsRef.current.has(w.id)); if (nextIdx !== -1) { setIndex(nextIdx); startTimeRef.current = performance.now(); } else { const wrapIdx = words.findIndex((w, i) => i <= index && !reviewedIdsRef.current.has(w.id)); if (wrapIdx !== -1) { setIndex(wrapIdx); startTimeRef.current = performance.now(); } else { setReviewState('results'); } } }, [index, scheduleNextDate, words]);
  useEffect(() => { if (selectAllCheckboxRef.current) { const correctResults = results.filter(r => r.correct); const numSelected = revisionIds.size; const numTotal = correctResults.length; selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numTotal; } }, [revisionIds, results]);
  const handleSelectForRevision = (wordId: string) => { setRevisionIds(prev => { const newSet = new Set(prev); if (newSet.has(wordId)) { newSet.delete(wordId); } else { newSet.add(wordId); } return newSet; }); };
  const handleSelectAllForRevision = (e: React.ChangeEvent<HTMLInputElement>) => { const correctWordIds = results.filter(r => r.correct).map(r => r.word.id); if (e.target.checked) { setRevisionIds(new Set(correctWordIds)); } else { setRevisionIds(new Set()); } };
  const handleBulkRevision = async () => { if (revisionIds.size === 0) return; const newResults = results.map(result => { if (revisionIds.has(result.word.id)) { const newNextDate = scheduleNextDate(0, false); return { ...result, correct: false, scheduledDate: newNextDate }; } return result; }); setResults(newResults); const updatePromises = Array.from(revisionIds).map(wordId => { const newNextDate = scheduleNextDate(0, false); return fetch('/api/words/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: wordId, next_review_date: newNextDate }) }); }); try { await Promise.all(updatePromises); } catch (err) { console.error('一括理解度修正に失敗:', err); } setRevisionIds(new Set()); };
  
  if (pageLoading) { return (<div className="flex items-center justify-center h-screen"><p className="text-slate-500">読み込み中...</p></div>) }
  
  const correctResults = results.filter(r => r.correct);
  const incorrectResults = results.filter(r => !r.correct);
  


return (
    <>
      {reviewState === 'idle' && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-w-full h-[93vh] overflow-hidden">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">こんにちは、{userId} さん</h2>
          {countLoading ? (<div className="animate-pulse text-slate-600">今日の復習単語数を読み込み中...</div>) : (<><p className="text-lg text-slate-600">本日復習する単語は</p><p className="text-7xl font-bold text-gray-600 my-4">{reviewCount}</p><p className="text-lg text-slate-600">語です</p></>)}
          {message && <p className="mt-4 text-yellow-800 bg-yellow-100 p-3 rounded-lg text-sm">{message}</p>}
          <button onClick={startReview} disabled={countLoading || !(reviewCount && reviewCount > 0)} className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">復習を始める</button>
        </div>
      )}

      {reviewState === 'loading' && (<div className="text-center p-8"><p className="text-slate-500">単語を読み込み中…</p></div>)}

      {reviewState === 'reviewing' && words.length > 0 && words[index] && (
        <ReviewCard key={words[index].id} word={words[index].word} currentIndex={reviewedIdsRef.current.size} totalWords={words.length} onAnswer={handleAnswer} />
      )}

      {reviewState === 'results' && (
        <div className="space-y-8 w-full">
          <h2 className="text-3xl font-bold text-slate-800 pt-12">復習結果</h2>
          {incorrectResults.length > 0 && (<div className="bg-white rounded-xl shadow-md border border-slate-200"><div className="p-6"><h3 className="text-xl font-semibold text-slate-800">要復習の単語</h3></div><div className="overflow-x-auto"><table className="min-w-full text-sm p-3"><thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left font-semibold text-slate-600">単語</th><th className="px-6 py-3 text-left font-semibold text-slate-600">意味</th><th className="px-6 py-3 text-left font-semibold text-slate-600">次回復習日</th></tr></thead><tbody className="divide-y divide-slate-200">{incorrectResults.map((r, i) => (<tr key={`incorrect-${i}`} className="bg-red-50/50"><td className="px-6 py-4 font-medium text-slate-900">{r.word.word}</td><td className="px-6 py-4 text-slate-700">{r.word.meaning}</td><td className="px-6 py-4 text-slate-500">{r.scheduledDate}</td></tr>))}</tbody></table></div></div>)}
          {correctResults.length > 0 && (<div className="bg-white rounded-xl shadow-md border border-slate-200"><div className="p-6"><h3 className="text-xl font-semibold text-slate-800">覚えている単語</h3><p className="pt-3">単語と意味のペアを確認し<br/>間違えて理解している場合は修正してください。</p></div><div className="overflow-x-auto"><table className="min-w-full text-sm p-3"><thead className="bg-slate-50"><tr><th className="p-4 w-12 text-center"><input type="checkbox" ref={selectAllCheckboxRef} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" onChange={handleSelectAllForRevision} checked={correctResults.length > 0 && revisionIds.size === correctResults.length}/></th><th className="px-6 py-3 text-left font-semibold text-slate-600">単語</th><th className="px-6 py-3 text-left font-semibold text-slate-600">意味</th><th className="px-6 py-3 text-left font-semibold text-slate-600">次回復習日</th></tr></thead><tbody className="divide-y divide-slate-200">{correctResults.map((r) => (<tr key={`correct-${r.word.id}`} className={`transition-colors ${revisionIds.has(r.word.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}><td className="p-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={revisionIds.has(r.word.id)} onChange={() => handleSelectForRevision(r.word.id)}/></td><td className="px-6 py-4 font-medium text-slate-900">{r.word.word}</td><td className="px-6 py-4 text-slate-700">{r.word.meaning}</td><td className="px-6 py-4 text-slate-500">{r.scheduledDate}</td></tr>))}</tbody></table></div></div>)}
          <div className="text-center pt-4"><button onClick={() => { setReviewState('idle'); setMessage(''); setRevisionIds(new Set()); fetchReviewCount(); }} className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition">ホームに戻る</button></div>
        </div>
      )}

      <div className={`fixed bottom-0 left-0 md:left-64 right-0 p-4 transition-transform duration-300 ${revisionIds.size > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">{revisionIds.size}語 選択中</span>
              <button onClick={handleBulkRevision} className="flex items-center bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition"><ReviseIcon /> 選択した単語の理解を修正</button>
          </div>
      </div>
    </>
  );
}