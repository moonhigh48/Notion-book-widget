'use client';
import { useState } from 'react';

export default function BookWidget() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState({ isbn: '', rating: 0 });

  const searchBooks = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/book?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      const highResData = data.map((book: any) => {
        let coverUrl = book.cover;
        if (coverUrl && coverUrl.includes('coversum')) {
          coverUrl = coverUrl.replace('coversum', 'cover500');
        }
        return { ...book, cover: coverUrl };
      });

      setBooks(highResData);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveWithRating = async (book: any, score: number) => {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        cover: book.cover,
        rating: score,
      }),
    });

    if (res.ok) {
      alert(`'${book.title}'이(가) ${score}점으로 저장되었습니다!`);
    } else {
      alert('저장에 실패했습니다.');
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
          <button 
            onClick={searchBooks}
            className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg active:scale-95 transition-all"
          >
            검색
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--color-primary)] font-medium">고화질 데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {books.map((book: any) => (
              <div 
                key={book.isbn} 
                className="group flex flex-col bg-[var(--color-card)] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[var(--color-primary)]/20 overflow-hidden"
              >

                <div className="relative aspect-[2/3] overflow-hidden">
                  <img 
                    src={book.cover}                     alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="p-3 flex flex-col items-center text-center">
                  <h3 className="text-[13px] font-bold line-clamp-1 w-full mb-0.5 group-hover:text-[var(--color-primary)] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 line-clamp-1 mb-3">{book.author}</p>
                  
                  <div className="w-full h-[1px] bg-gray-100 mb-2" />
                  
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHovered = hover.isbn === book.isbn && star <= hover.rating;
                      return (
                        <button
                          key={star}
                          onMouseEnter={() => setHover({ isbn: book.isbn, rating: star })}
                          onMouseLeave={() => setHover({ isbn: '', rating: 0 })}
                          onClick={() => saveWithRating(book, star)}
                          className={`text-xl transition-all duration-200 hover:scale-125 active:scale-90 ${
                            isHovered ? 'text-[var(--color-star-fill)] drop-shadow-sm' : 'text-[var(--color-star-empty)]'
                          }`}
                        >
                          ★
                        </button>
                      );
                    })}
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
