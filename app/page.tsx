'use client';
import { useState } from 'react';

export default function BookWidget() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 별점 관련 상태 추가
  const [hover, setHover] = useState({isbn:'', rating:0}); 

  // 1. 검색 함수
  const searchBooks = async () => {
    setLoading(true);
    const res = await fetch(`/api/book?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setBooks(data);
    setLoading(false);
  };

  // 2. 별점 클릭 시 즉시 노션으로 저장하는 함수
  const saveWithRating = async (book: any, score: number) => {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        cover: book.cover,
        rating: score, // 별점(숫자)을 함께 보냅니다.
      }),
    });

    if (res.ok) {
      alert(`'${book.title}'이(가) ${score}점으로 노션에 저장되었습니다!`);
    } else {
      alert('저장에 실패했습니다. 노션 데이터베이스 설정을 확인해주세요.');
    }
  };

  return (
    <div style={{
      "--color1":"#f8edeb",
      "--color2":"#e9a598",
      "--color3":"#d48c7e",
      "--color4":"#C77B6D",
      "--color5":"#f3dad6"
    } as React.CSSProperties}
    // 검색창 영역
      className="p-4 bg-[var(--color1)] min-h-screen konkon">
      <div className="px-4 py-2 max-w-98 mx-auto">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="책 제목 검색..."
            className="selection:bg-[var(--color4)] selection:text-white outline-none border border-[var(--color2)] 
            focus:border-[var(--color3)] focus:ring-1 focus:ring-[var(--color3)] 
            p-2 flex-1 rounded text-bold text-[var(--color3)] font-bold"
            onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
          />
          <button onClick={searchBooks} className={`bg-[var(--color2)] text-white p-2 rounded`}>
            검색
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-[var(--color4)]">검색 중...</p>}

      <div className="space-y-4 flex flex-col items-center w-full ">
        {books.map((book: any) => (
          <div key={book.isbn} className="border border-[var(--color3)] w-full max-w-90 p-4 rounded-lg flex gap-3 [var(--color1)] shadow-sm items-center">
            <img src={book.cover} alt={book.title} className="w-20 h-30 object-cover shadow flex-shrink-0"/>
            <div className="flex flex-col">
              <h3 className="font-bold text-sm line-clamp-2 text-[var(--color3)] text-center">{book.title}</h3>
              <p className="text-xs text-[var(--color2)] text-center mb-3">{book.author}</p>
              {/* 별점 저장 UI 부분 */}
              <div className="flex flex-col items-center border-t border-[var(--color4)] pt-3 w-full">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isHovered = hover.isbn === book.isbn && star <= hover.rating;
                  return (
                    <button
                      key={star}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        isHovered ? 'text-[var(--color3)]' : 'text-[var(--color5)]'
                      }`}
                      onMouseEnter={() => setHover({isbn:book.isbn, rating:star})}
                      onMouseLeave={() => setHover({isbn:'', rating:0})}
                      onClick={() => saveWithRating(book, star)} // 클릭하면 바로 저장 함수 호출!
                    >
                      ★
                    </button>
                  )})}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
