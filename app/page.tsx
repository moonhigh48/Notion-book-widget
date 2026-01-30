'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]); // 모든 형식을 허용하도록 수정
  const [loading, setLoading] = useState(false);

  // 검색 기능
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/book?keyword=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 노션 저장 기능
  const handleSave = async (book: any) => {
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          cover: book.cover
        })
      });
      if (res.ok) alert('노션에 저장 성공! 🎉');
      else alert('저장 실패! 노션 연결 설정을 확인하세요.');
    } catch (error) {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  return (
    <div style={{ padding: '20px', color: 'black', background: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '15px' }}>📚 책 검색 & 노션 저장</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="검색어를 입력하세요"
          style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', color: 'black' }}
        />
        <button 
          onClick={handleSearch}
          style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? '...' : '검색'}
        </button>
      </div>

      <div>
        {results.map((book: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            padding: '10px', 
            borderBottom: '1px solid #eee' 
          }}>
            <img src={book.cover} width="50" alt="cover" style={{ borderRadius: '4px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{book.title}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{book.author}</div>
            </div>
            <button 
              onClick={() => handleSave(book)}
              style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
            >
              저장
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}