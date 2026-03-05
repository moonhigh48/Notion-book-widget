import { NextResponse } from 'next/server';

const ALADIN_KEY = process.env.ALADIN_TTB_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  
  const url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(keyword)}&Output=js&Version=20131101`;

  try {
    const response = await fetch(url);
    const textData = await response.text();
    const cleanData = JSON.parse(textData.replace(/;$/, ''));
    return NextResponse.json(cleanData.item || []);
  } catch (error) {
    return NextResponse.json({ error: '검색 실패' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let { title, author, cover, rating, status, date } = await request.json();
    
    if (cover && cover.includes('coversum')) {
        cover = cover.replace('coversum', 'cover500');
    }

    const properties = {
      "제목": { title: [{ text: { content: title } }] },
      "저자": { rich_text: [{ text: { content: author } }] },
      "상태": { status: { name: status || "읽을 예정" } },
      "표지": { "files": [{ "name": "Cover Image", "type": "external", "external": { "url": cover } }] }
    };

    if (rating !== null && rating !== undefined) {
      properties["평점"] = { number: rating };
    }

    if (date) {
      properties["날짜"] = { date: { start: date } };
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB_ID },
        properties: properties
      })
    });
    

    if (response.ok) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  };
}
