'use client';
import { useState, useMemo } from 'react';

export default function BookWidget() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]); // 전체 검색 결과 저장소
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 필터링 상태
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState({ isbn: '', rating: 0 });
  const [savingStatus, setSavingStatus] = useState<Record<string, string>>({});

  // 1. 검색 결과에서 중복 없이 세부 장르(소설, 에세이 등) 추출
  const dynamicCategories = useMemo(() => {
    if (books.length === 0) return [];
    
    const cats = books.map((b: any) => {
      const parts = b.categoryName?.split('>') || [];
      // parts[0]은 "국내도서", parts[1]이 "소설", "에세이" 등 실제 장르입니다.
      return parts.length > 1 ? parts[1].trim() : "기타";
    });
    
    // "전체"를 맨 앞에 두고, 중복된 장르를 제거하여 배열 생성
    return ["전체", ...Array.from(new Set(cats))];
  }, [books]);

  // 2. 선택된 세부 장르에 따라 리스트 필터링
  const filteredBooks = useMemo(() => {
    if (selectedCategory === '전체') return books;
    return books.filter((b: any) => {
      const parts = b.categoryName?.split('>') || [];
      const genre = parts.length > 1 ? parts[1].trim() : "기타";
      return genre === selectedCategory;
    });
  }, [books, selectedCategory]);

  const searchBooks = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedCategory('전체'); // 새로운 검색 시 필터 초기화
    try {
      const res = await fetch(`/api/book?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      const processedData = data.map((book: any) => {
        let coverUrl = book.cover;
        if (coverUrl && coverUrl.includes('coversum')) {
          coverUrl = coverUrl.replace('coversum', 'cover500');
        }
        const cleanAuthor = book.author 
          ? book.author.replace(/\s*\(.*?\)/g, '').trim() 
          : "저자 미상";

        return { ...book, cover: coverUrl, author: cleanAuthor };
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
        "--color-bg": "#E0EBEF",
        "--color-card": "#FFFFFF",
        "--color-primary": "#8CB4C5",
        "--color-text": "#3D5058",
        "--color-star-empty": "#D1DEE4",
        "--color-star-fill": "#5C8DA3",
      } as React.CSSProperties}
      // shadow 제거 및 테두리만 남김
      className="h-screen w-full max-w-md mx-auto flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden border-x border-gray-200"
    >
      {/* 상단 검색 및 카테고리 필터 영역 */}
      <div className="pt-8 pb-5 px-6 bg-[var(--color-bg)]">
        <div className="relative group mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
            placeholder="search for title, author, or genre"
            className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3 rounded-full text-sm outline-none shadow-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all placeholder:text-gray-300"
          />
        </div>  

        {/* 동적 세부 장르 필터 버튼 */}
        {dynamicCategories.length > 1 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text)] shrink-0">
                categories
              </span>
              <div className="h-[1px] bg-[var(--color-text)] opacity-20 w-12" />
            </div>
            <div className="flex flex-wrap gap-2">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-[11px] rounded-full border transition-all active:scale-95 ${
                    selectedCategory === cat 
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-bold' 
                    : 'bg-white/50 text-gray-500 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse text-[var(--color-primary)]">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">searching...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBooks.map((book: any) => (
              <div 
                key={book.isbn} 
                className="group relative flex bg-[var(--color-card)] rounded-2xl border border-transparent hover:border-[var(--color-primary)]/20 overflow-hidden h-32 shadow-none"
              >
                {savingStatus[book.isbn] && (
                  <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-white backdrop-blur-[1px] ${
                    savingStatus[book.isbn] === 'saving' ? 'bg-black/10' : 
                    savingStatus[book.isbn] === 'success' ? 'bg-[#5C8DA3]/90' : 'bg-red-500/60'
                  }`}>
                    {savingStatus[book.isbn] === 'saving' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                     savingStatus[book.isbn] === 'success' ? '✓ 저장됨' : '✕ 실패'}
                  </div>
                )}

                <div className="w-24 flex-shrink-0 overflow-hidden bg-gray-50">
                  <img src={book.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 onClick={() => saveBook(book, null, '읽을 예정')} className="text-[14px] font-bold line-clamp-1 cursor-pointer hover:text-[var(--color-primary)] transition-colors mb-0.5">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{book.author}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="w-full h-[1px] bg-gray-50" />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHover({ isbn: book.isbn, rating: star })}
                          onMouseLeave={() => setHover({ isbn: '', rating: 0 })}
                          onClick={() => saveBook(book, star, '완독')}
                          className={`text-lg transition-transform hover:scale-125 ${hover.isbn === book.isbn && star <= hover.rating ? 'text-[var(--color-star-fill)]' : 'text-[var(--color-star-empty)]'}`}
                        >★</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
