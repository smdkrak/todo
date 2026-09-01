# Todo

개인용 반응형 Todo/Kanban 웹앱입니다.

## Google Calendar 연결

1. Google Cloud Console에서 프로젝트를 만들고 **Google Calendar API**를 활성화합니다.
2. OAuth 동의 화면을 구성한 뒤 **웹 애플리케이션** OAuth 클라이언트를 만듭니다.
3. 승인된 JavaScript 원본에 `http://localhost:8443`과 실제 배포 도메인을 등록합니다.
4. `.env.example`을 `.env.local`로 복사하고 OAuth 클라이언트 ID를 입력합니다.
5. 앱 우측 상단 달력의 **Google** 버튼을 눌러 읽기 전용 권한을 승인합니다.

OAuth 액세스 토큰은 브라우저 저장소에 보관하지 않으며 새 세션에서는 다시 연결해야 합니다.

## 클라우드 DB 설정 (Supabase 무료)

1. [Supabase](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/migrations/20260901000000_initial.sql`을 실행합니다.
3. Project Settings → API에서 Project URL과 Publishable key를 확인합니다.
4. `.env.local`에 아래 값을 추가합니다.

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

5. Authentication → URL Configuration에서 Site URL과 Redirect URLs에 로컬 및 배포 주소를 등록합니다.
6. 처음 한 번 이메일 매직링크로 가입한 뒤, 개인 전용으로 운영하려면 Authentication 설정에서 신규 사용자 가입을 비활성화합니다.

`service_role` 키는 브라우저 코드나 Cloudflare Pages 환경변수에 절대 넣지 마세요. 공개용 Publishable/anon key만 사용하며, 실제 데이터 접근은 SQL의 RLS 정책이 로그인 사용자 ID를 검사해 차단합니다.

## 무료 배포 (Cloudflare Pages)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에서 Workers & Pages → Create → Pages → Connect to Git을 선택합니다.
2. GitHub 저장소 `smdkrak/todo`를 연결합니다.
3. 빌드 설정을 입력합니다.

```text
Framework preset: Vite
Build command: pnpm build
Build output directory: dist
Node.js version: 22
```

4. Settings → Environment variables에 다음 값을 등록합니다.

```text
VITE_GOOGLE_CLIENT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

5. 첫 배포 후 발급된 `https://...pages.dev` 주소를 아래 두 서비스에 추가합니다.
   - Supabase Authentication의 Site URL / Redirect URLs
   - Google OAuth 클라이언트의 승인된 JavaScript 원본
6. 다시 배포한 뒤 이메일 로그인과 Google Calendar 연결을 확인합니다.

`public/_headers`에는 CSP, 클릭재킹 방지, MIME 스니핑 방지, 권한 제한 및 HTTPS 강제 헤더가 포함되어 있습니다. 데이터베이스는 RLS가 활성화되어 익명 사용자의 접근이 차단되고 로그인 사용자는 자신의 행만 읽고 수정할 수 있습니다.
todo 내맘대로
