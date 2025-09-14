// pages/words/index.tsx
'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';

// --- 型定義 (変更なし) ---
type Word = { id: string; user_id: string; word: string; meaning: string | null; created_at: string; updated_at?: string; };
type WordPair = { word: string; meaning: string; };

// --- アイコンコンポーネント (変更なし) ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;


export default function WordsPage() {
  const router = useRouter();
  
  // --- State変数 ---
  const [userId, setUserId] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [modalWord, setModalWord] = useState('');
  const [modalMeaning, setModalMeaning] = useState('');
  const [modalError, setModalError] = useState('');
  const [isBatchFormVisible, setIsBatchFormVisible] = useState(false);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([{ word: '', meaning: '' }]);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [wordIdsToDelete, setWordIdsToDelete] = useState<Set<string>>(new Set());
  
  // ★★★ 新規追加: 検索機能用のState ★★★
  const [searchQuery, setSearchQuery] = useState('');
  
  // refの追加
  const batchFormRef = useRef<HTMLFormElement>(null);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // ★★★ 新規追加: 検索フィルタリングロジック ★★★
  const filteredWords = useMemo(() => {
    // 検索クエリがない場合は、全ての単語を返す
    if (!searchQuery) {
      return words;
    }
    // 検索クエリを小文字に変換
    const lowerCaseQuery = searchQuery.toLowerCase();
    // 単語と意味の両方を対象にフィルタリング
    return words.filter(word =>
      word.word.toLowerCase().includes(lowerCaseQuery) ||
      (word.meaning && word.meaning.toLowerCase().includes(lowerCaseQuery))
    );
  }, [words, searchQuery]);


  // --- データ取得・認証関連 (変更なし) ---
  const fetchWords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/words', { credentials: 'include' });
      if (!res.ok) throw new Error('単語一覧の再取得に失敗しました');
      const data: Word[] = await res.json();
      setWords(data);
    } catch (e: any) {
      setPageError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error("認証に失敗しました");
        const json = await res.json();
        setUserId(json.user.userId);
      } catch {
        router.push('/login');
      }
    })();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchWords();
    }
  }, [userId, fetchWords]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const numSelected = selectedWordIds.size;
      // ★★★ 改善点: 全単語数ではなく、フィルタリング後の単語数を基準にする ★★★
      const numTotal = filteredWords.length; 
      selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numTotal;
    }
  }, [selectedWordIds, filteredWords]); // ★★★ 依存配列を words から filteredWords に変更 ★★★

  // --- 単語一覧の選択関連の関数 ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // ★★★ 改善点: 表示されている単語（検索結果）のみをすべて選択する ★★★
      const allWordIds = new Set(filteredWords.map(w => w.id));
      setSelectedWordIds(allWordIds);
    } else {
      setSelectedWordIds(new Set());
    }
  };

  const handleSelectOne = (wordId: string) => {
    setSelectedWordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) { newSet.delete(wordId); }
      else { newSet.add(wordId); }
      return newSet;
    });
  };

  const handleEditSelected = () => {
    if (selectedWordIds.size !== 1) return;
    const selectedId = Array.from(selectedWordIds)[0];
    const wordToEdit = words.find(w => w.id === selectedId);
    if (wordToEdit) {
      setEditingWord(wordToEdit);
      setModalWord(wordToEdit.word);
      setModalMeaning(wordToEdit.meaning || '');
      setModalError('');
      setIsModalOpen(true);
    }
  };
  
  // --- 削除処理 (変更なし) ---
  const handleBulkDeleteClick = () => {
    if (selectedWordIds.size === 0) return;
    setWordIdsToDelete(new Set(selectedWordIds));
    setIsDeleteModalOpen(true);
  };
  
  const confirmBulkDelete = async () => {
    if (wordIdsToDelete.size === 0) return;
    setPageError(null);
    try {
      const deletePromises = Array.from(wordIdsToDelete).map(id => 
        fetch(`/api/words?id=${id}`, { method: 'DELETE', credentials: 'include' })
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter(res => !res.ok);

      if (failed.length > 0) {
        throw new Error(`${failed.length}語の単語の削除に失敗しました。`);
      }
      
      setWords(prevWords => prevWords.filter(w => !wordIdsToDelete.has(w.id)));
      setSelectedWordIds(new Set());

    } catch (e: any) {
      setPageError(e.message);
    } finally {
      setIsDeleteModalOpen(false);
      setWordIdsToDelete(new Set());
    }
  };


  // --- モーダル・単一編集 (変更なし) ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
    setSelectedWordIds(new Set());
  };

  const handleUpdateWord = async (e: React.FormEvent, wordId: string) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await fetch('/api/words', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: wordId, word: modalWord, meaning: modalMeaning }), });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `APIエラー`);
      setWords(words.map(w => (w.id === result.data.id ? result.data : w)));
      handleCloseModal();
    } catch (err: any) { setModalError(err.message); }
  };


  // --- 一括登録フォームの関数 (変更なし) ---
  const handleRemovePair = (index: number) => setWordPairs(prev => prev.filter((_, i) => i !== index));
  const handlePairChange = (index: number, field: 'word' | 'meaning', value: string) => {
    setWordPairs(prev => {
      const newPairs = [...prev];
      newPairs[index][field] = value;
      return newPairs;
    });
  };
  const handleAddPair = useCallback(() => {
    setWordPairs(prev => [...prev, { word: '', meaning: '' }]);
    setTimeout(() => {
        const nextInput = batchFormRef.current?.querySelector<HTMLInputElement>(`[data-row-index="${wordPairs.length}"][data-col-index="0"]`);
        nextInput?.focus();
    }, 0);
  }, [wordPairs.length]);

  const handleBatchSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsBatchLoading(true);
    setBatchMessage(null);
    const validPairs = wordPairs.filter(p => p.word.trim() && p.meaning.trim());
    if (validPairs.length === 0) {
      setBatchMessage('有効な単語ペアを入力してください。');
      setIsBatchLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/words/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pairs: validPairs }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || '一括保存に失敗しました');
      setBatchMessage(result.message);
      setWordPairs([{ word: '', meaning: '' }]);
      setIsBatchFormVisible(false);
      await fetchWords();
    } catch (err: any) {
      setBatchMessage(`エラー: ${err.message}`);
    } finally {
      setIsBatchLoading(false);
    }
  };
  
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, metaKey, ctrlKey, shiftKey } = e;
    const isCmd = metaKey || ctrlKey;
    const target = e.currentTarget;

    if (isCmd && shiftKey && key === 'Enter') {
      e.preventDefault();
      handleBatchSubmit();
      return;
    }

    if (isCmd && !shiftKey && key === 'Enter') {
      e.preventDefault();
      handleAddPair();
      return;
    }
    
    if (key === 'Enter' && !isCmd && !shiftKey) {
        e.preventDefault();
        return;
    }


    const rowIndex = parseInt(target.dataset.rowIndex || '0');
    const colIndex = parseInt(target.dataset.colIndex || '0');
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (key) {
      case 'ArrowUp': e.preventDefault(); nextRow = rowIndex > 0 ? rowIndex - 1 : wordPairs.length - 1; break;
      case 'ArrowDown': e.preventDefault(); nextRow = rowIndex < wordPairs.length - 1 ? rowIndex + 1 : 0; break;
      case 'ArrowLeft': e.preventDefault(); nextCol = colIndex > 0 ? colIndex - 1 : 1; if (colIndex === 0) nextRow = rowIndex > 0 ? rowIndex - 1 : wordPairs.length - 1; break;
      case 'ArrowRight': e.preventDefault(); nextCol = colIndex < 1 ? colIndex + 1 : 0; if (colIndex === 1) nextRow = rowIndex < wordPairs.length - 1 ? rowIndex + 1 : 0; break;
      default: return;
    }
    
    const nextInput = batchFormRef.current?.querySelector<HTMLInputElement>(`[data-row-index="${nextRow}"][data-col-index="${nextCol}"]`);
    nextInput?.focus();
  };
  
  // --- レンダリング ---
  if (loading && !words.length) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">読み込み中…</div>;
  }
  
  return (
    <>
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setIsBatchFormVisible(!isBatchFormVisible)} className="w-full p-6 text-left flex justify-between items-center" >
              <h2 className="text-xl font-semibold text-slate-800">新しく単語を保存する</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-500 transition-transform ${isBatchFormVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isBatchFormVisible && (
              <div className="px-6 pb-6 border-t border-slate-200">
                <form ref={batchFormRef} onSubmit={handleBatchSubmit} className="mt-6 space-y-4">
                  {wordPairs.map((pair, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center">
                      <input type="text" placeholder={`単語 ${idx + 1}`} value={pair.word} onChange={e => handlePairChange(idx, 'word', e.target.value)} onKeyDown={handleFormKeyDown} data-row-index={idx} data-col-index="0" className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                      <input type="text" placeholder={`意味 ${idx + 1}`} value={pair.meaning} onChange={e => handlePairChange(idx, 'meaning', e.target.value)} onKeyDown={handleFormKeyDown} data-row-index={idx} data-col-index="1" className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                      {wordPairs.length > 1 && <button type="button" title="この行を削除" onClick={() => handleRemovePair(idx)} className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center hover:bg-red-200 transition-colors">×</button>}
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-2">
                      <button type="button" onClick={handleAddPair} className="bg-slate-200 text-slate-800 px-6 py-2 rounded-md font-semibold hover:bg-slate-300 transition-colors">行を追加</button>
                      <button type="submit" disabled={isBatchLoading} className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400">{isBatchLoading ? '保存中...' : '保存する'}</button>
                  </div>
                  {batchMessage && <p className={`mt-3 text-sm font-medium ${batchMessage.startsWith('エラー') ? 'text-red-600' : 'text-emerald-600'}`}>{batchMessage}</p>}
                </form>
              </div>
            )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4 sm:mb-0">保存した英単語 ： {words.length} 語</h2>
                  {/* ★★★ 新規追加: 検索フォーム ★★★ */}
                  <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="単語や意味で検索..."
                      className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        ref={selectAllCheckboxRef} 
                        onChange={handleSelectAll} 
                        // ★★★ 改善点: フィルタリング後の単語数を基準にチェック状態を決定 ★★★
                        checked={filteredWords.length > 0 && selectedWordIds.size === filteredWords.length} 
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">単語</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">意味</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">登録日時</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* ★★★ 改善点: words.map を filteredWords.map に変更 ★★★ */}
                  {filteredWords.map(w => (
                    <tr key={w.id} className={`transition-colors ${selectedWordIds.has(w.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 text-center">
                        <input type="checkbox" checked={selectedWordIds.has(w.id)} onChange={() => handleSelectOne(w.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{w.word}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">{w.meaning}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(w.created_at).toLocaleDateString('ja-JP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* ★★★ 新規追加: 検索結果が0件の場合のメッセージ ★★★ */}
              {words.length > 0 && filteredWords.length === 0 && (
                <p className="text-center text-slate-500 py-12">
                  「<span className="font-semibold">{searchQuery}</span>」に一致する単語は見つかりませんでした。
                </p>
              )}
              {words.length === 0 && !loading && <p className="text-center text-slate-500 py-12">単語が登録されていません。</p>}
            </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 md:left-64 right-0 p-4 transition-transform duration-300 ${selectedWordIds.size > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">{selectedWordIds.size}語 選択中</span>
              <div className="flex gap-3">
                  {selectedWordIds.size === 1 && (
                      <button onClick={handleEditSelected} className="flex items-center bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                          <EditIcon /> 編集
                      </button>
                  )}
                  <button onClick={handleBulkDeleteClick} className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition">
                      <DeleteIcon /> {selectedWordIds.size > 1 ? '選択した項目を削除' : '削除'}
                  </button>
              </div>
          </div>
      </div>

      {isModalOpen && editingWord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity" onClick={handleCloseModal}>
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">単語を編集</h2>
            <form onSubmit={(e) => handleUpdateWord(e, editingWord.id)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">単語</label>
                  <input type="text" value={modalWord} onChange={e => setModalWord(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">意味</label>
                  <input type="text" value={modalMeaning} onChange={e => setModalMeaning(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              {modalError && <p className="text-sm text-red-600 mt-2">{modalError}</p>}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">キャンセル</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">変更を保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg leading-6 font-medium text-slate-900 mt-4">
                  単語を削除します
              </h3>
              <div className="mt-2">
                  <p className="text-sm text-slate-500">
                      選択した単語を本当に削除しますか？<br/>この操作は元に戻せません。
                  </p>
              </div>
            <div className="flex justify-center gap-4 mt-8">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                キャンセル
              </button>
              <button type="button" onClick={confirmBulkDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}