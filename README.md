# SNS 캠페인 결과 레퍼런스 사이트

스토어링크 SNS 캠페인 실적을 관리하고 공유하기 위한 사이트입니다.

## 기능

- **공개 페이지** (`/`) — 로그인 없이 누구나 열람 가능한 레퍼런스 목록
- **관리자 페이지** (`/admin`) — 팀원이 로그인하여 레퍼런스 추가·편집·삭제
- **Notion 연동** — Notion 데이터베이스에서 레퍼런스 정보 동기화
- **카테고리 필터** — 카테고리별 필터링
- **익명 표시** — 계정명을 비공개로 하여 사례만 게재 가능

---

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

| URL | 내용 |
|-----|------|
| `/` | 공개 레퍼런스 페이지 |
| `/login` | 팀원 로그인 |
| `/admin` | 관리자 대시보드 |
| `/admin/cards/new` | 레퍼런스 새로 추가 |
| `/admin/notion-sync` | Notion 연동 설정 |

---

## 환경 변수 설정 (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NOTION_API_KEY=ntn_xxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Notion 연동

1. `/admin/notion-sync` 접속
2. **"Notion에서 동기화"** 버튼 클릭
3. Notion DB 내용이 레퍼런스 카드에 반영됨 (삭제도 반영)

---

## 디렉토리 구조

```
.
├── app/
│   ├── page.tsx              # 공개 레퍼런스 페이지
│   ├── PublicShowcase.tsx    # 공개 페이지 UI
│   ├── login/                # 로그인 페이지
│   └── admin/
│       ├── page.tsx          # 관리자 대시보드
│       ├── AdminCardList.tsx # 카드 목록·삭제
│       ├── cards/
│       │   ├── new/          # 새로 추가
│       │   └── [id]/edit/    # 편집
│       └── notion-sync/      # Notion 연동
├── components/
├── lib/
│   ├── supabase/
│   └── notion.ts
├── supabase/
│   └── schema.sql
└── types/
    └── index.ts
```
