'use client';
import { useState } from 'react';

export default function BookWidget() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState({isbn:'', rating:0}); 

 const searchBooks = async () => {
    setLoading(true);
    const res = await fetch(`/api/book?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setBooks(data);
    setLoading(false);
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
   
      className="embed-container border border-[var(--color4)] p-4 bg-[var(--color1)]
      h-screen overflow-hidden flex flex-col konkon max-w-120 mx-auto">
      <div className="sticky top-0 z-10 px-4 pb-1 w-full max-w-90 mx-auto">
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

      <div className="custom-scroll space-y-0 flex flex-col items-center w-full overflow-y-auto flex-1 px-4 pb-10">
        {books.map((book: any) => (
          <div key={book.isbn} className=" w-full max-w-90 p-4 flex gap-3 [var(--color1)] items-center">
            <img src={book.cover} alt={book.title} className="w-20 h-30 object-cover shadow flex-shrink-0"/>
            <div className="flex flex-col flex-1 h-full justify-center py-1">
              <h3 className="font-bold text-sm line-clamp-1 text-[var(--color3)] line-clamp-1 text-center">{book.title}</h3>
              <p className="text-xs text-[var(--color2)] text-center mb-3">{book.author}</p>

              <div className="flex flex-col items-center border-t border-[var(--color4)] pt-2 w-full">
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
