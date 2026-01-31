'use client';
import { useState } from 'react';

export default function BookWidget() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 별점 관련 상태 추가
  const [hover, setHover] = useState(0); 

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
    <div className="p-4 max-w-md mx-auto font-sans">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="책 제목 검색..."
          className="border p-2 flex-1 rounded text-black"
          onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
        />
        <button onClick={searchBooks} className="bg-blue-500 text-white p-2 rounded">
          검색
        </button>
      </div>

      {loading && <p className="text-center">검색 중...</p>}

      <div className="space-y-4">
        {books.map((book: any) => (
          <div key={book.isbn} className="border p-4 rounded-lg flex flex-col items-center bg-white shadow-sm">
            <img src={book.cover} alt={book.title} className="w-24 h-36 object-cover mb-2 shadow" />
            <h3 className="font-bold text-center text-sm line-clamp-2 text-black">{book.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{book.author}</p>

            {/* 별점 저장 UI 부분 */}
            <div className="flex flex-col items-center border-t pt-3 w-full">
              <span className="text-xs text-gray-400 mb-1">별점을 클릭하여 저장</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`text-3xl transition-transform hover:scale-125 ${
                      star <= hover ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => saveWithRating(book, star)} // 클릭하면 바로 저장 함수 호출!
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
