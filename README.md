# Todo

개인용 반응형 Todo/Kanban 웹앱입니다.

## Google Calendar 연결

1. Google Cloud Console에서 프로젝트를 만들고 **Google Calendar API**를 활성화합니다.
2. OAuth 동의 화면을 구성한 뒤 **웹 애플리케이션** OAuth 클라이언트를 만듭니다.
3. 승인된 JavaScript 원본에 `http://localhost:8443`과 실제 배포 도메인을 등록합니다.
4. `.env.example`을 `.env.local`로 복사하고 OAuth 클라이언트 ID를 입력합니다.
5. 앱 우측 상단 달력의 **Google** 버튼을 눌러 읽기 전용 권한을 승인합니다.

OAuth 액세스 토큰은 브라우저 저장소에 보관하지 않으며 새 세션에서는 다시 연결해야 합니다.
todo 내맘대로
