'use client';
import { useState } from 'react';

export default function BookWidget() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState({ isbn: '', rating: 0 });
  const [savingStatus, setSavingStatus] = useState<Record<string, string>>({});

  const searchBooks = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/book?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      const processedData = data.map((book: any) => {
        // 1. 고해상도 표지 전환
        let coverUrl = book.cover;
        if (coverUrl && coverUrl.includes('coversum')) {
          coverUrl = coverUrl.replace('coversum', 'cover500');
        }
        
        // 2. 작가 이름 정제 (지은이, 옮긴이 등 제거)
        const cleanAuthor = book.author 
          ? book.author.replace(/\s*\(.*?\)/g, '').trim() 
          : "저자 미상";

        return { 
          ...book, 
          cover: coverUrl,
          author: cleanAuthor 
        };
      });

      setBooks(processedData);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveBook = async (book: any, score: number | null, status: string) => {
    const bookId = book.isbn;
    setSavingStatus(prev => ({ ...prev, [bookId]: 'saving' }));
    
    const payload = {
      title: book.title,
      author: book.author,
      cover: book.cover,
      status: status,
      rating: score,
      date: status === '완독' ? new Date().toISOString().split('T')[0] : null
    };

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSavingStatus(prev => ({ ...prev, [bookId]: 'success' }));
        setTimeout(() => {
          setSavingStatus(prev => {
            const next = { ...prev };
            delete next[bookId];
            return next;
          });
        }, 2000);
      } else {
        throw new Error();
      }
    } catch (error) {
      setSavingStatus(prev => ({ ...prev, [bookId]: 'error' }));
      setTimeout(() => {
        setSavingStatus(prev => {
          const next = { ...prev };
          delete next[bookId];
          return next;
        });
      }, 3000);
    }
  };

  return (
    <div 
      style={{
        "--color-bg": "#fdfaf9",
        "--color-card": "#ffffff",
        "--color-primary": "#e9a598",
        "--color-text": "#5a4a42",
        "--color-star-empty": "#eee1df",
        "--color-star-fill": "#d48c7e",
      } as React.CSSProperties}
      className="h-screen w-full max-w-md mx-auto flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden border-x border-gray-100 shadow-2xl"
    >
      <div className="sticky top-0 z-20 p-5 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-primary)]/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
            placeholder="어떤 책을 읽으셨나요?"
            className="flex-1 bg-white border border-[var(--color-primary)]/40 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all"
          />
          <button onClick={searchBooks} className="bg-[var(--color-primary)] text-white px-3 py-2.5 rounded-xl text-sm font-bold active:scale-95">
            검색
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-5">
          {books.map((book: any) => (
            <div key={book.isbn} className="group relative flex flex-col bg-[var(--color-card)] rounded-2xl shadow-sm border border-transparent hover:border-[var(--color-primary)]/20 overflow-hidden">
              {savingStatus[book.isbn] && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-white backdrop-blur-[1px] ${
                  savingStatus[book.isbn] === 'saving' ? 'bg-black/20' : 
                  savingStatus[book.isbn] === 'success' ? 'bg-black/60' : 'bg-red-500/60'
                }`}>
                  {savingStatus[book.isbn] === 'saving' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                   savingStatus[book.isbn] === 'success' ? '✓ 저장됨' : '✕ 실패'}
                </div>
              )}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img src={book.cover} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex flex-col items-center text-center">
                <h3 onClick={() => saveBook(book, null, '읽을 예정')} className="text-[11px] font-bold line-clamp-1 w-full cursor-pointer hover:underline mb-0.5">
                  {book.title}
                </h3>
                <p className="text-[9px] text-gray-400 line-clamp-1 mb-2">{book.author}</p>
                <div className="w-full h-[1px] bg-gray-100 mb-2" />
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHover({ isbn: book.isbn, rating: star })}
                      onMouseLeave={() => setHover({ isbn: '', rating: 0 })}
                      onClick={() => saveBook(book, star, '완독')}
                      className={`text-sm transition-transform hover:scale-125 ${hover.isbn === book.isbn && star <= hover.rating ? 'text-[var(--color-star-fill)]' : 'text-[var(--color-star-empty)]'}`}
                    >★</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
