# 🃏 UNO Connect

실시간 멀티플레이 원카드 게임
[여기를 클릭해서 플레이](https://mahyun-dev.github.io/one-card/)

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)

## ✨ 주요 기능

- 🎮 **실시간 멀티플레이**: Firebase Realtime Database를 활용한 실시간 게임
- 🎫 **6자리 초대 코드**: 간편한 방 생성 및 참여
- 🎨 **다크모드 네온 UI**: 부드러운 애니메이션과 네온 스타일 디자인
- 📱 **완벽한 반응형**: PC와 모바일에 최적화된 UI/UX
- 🃏 **부채꼴 카드 배치**: 자연스러운 카드 핸들링 경험
- ⚡ **실시간 동기화**: 모든 플레이어의 액션이 즉시 반영

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/mahyun-dev/one-card.git
cd one-card
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Realtime Database 활성화
3. 웹 앱 등록 및 설정 정보 복사
4. `.env.example`을 `.env`로 복사하고 Firebase 설정 정보 입력

```bash
cp .env.example .env
```

```.env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 5. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── api/                    # Firebase 및 API 로직
│   ├── firebase.js        # Firebase 초기화
│   ├── roomApi.js         # 방 생성/참여/관리
│   └── gameApi.js         # 게임 로직 (카드 드로우, 플레이, 턴)
├── components/            # React 컴포넌트
│   ├── layout/           # Header, Footer, Modal, Toast
│   ├── lobby/            # CreateRoom, JoinRoom, WaitingRoom
│   └── game/             # Card, PlayerHand, GameBoard, TurnIndicator
├── hooks/                # 커스텀 훅
│   ├── useGameSync.js    # Firebase 실시간 동기화
│   └── useAI.js          # AI 로직 (향후 확장)
├── store/                # 전역 상태 관리
│   └── useGameStore.js   # Zustand 스토어
├── utils/                # 유틸리티 함수
│   ├── cardDeck.js       # 카드 생성, 셔플, 스타일
│   └── gameRules.js      # 게임 규칙 검증
├── pages/                # 페이지 컴포넌트
│   └── Home.jsx          # 메인 페이지
├── App.jsx               # 라우팅 설정
├── main.jsx              # 진입점
└── index.css             # 글로벌 스타일
```

## 🎮 게임 규칙

### 기본 규칙
- **시작**: 각 플레이어에게 7장씩 카드 분배
- **목표**: 손에 있는 모든 카드를 먼저 없애는 것
- **턴**: 같은 색상 또는 같은 숫자/기호의 카드를 낼 수 있음
- **UNO**: 카드가 1장 남으면 "UNO!" 알림

### 특수 카드
| 카드 | 효과 |
|------|------|
| **스킵 (⊘)** | 다음 플레이어의 차례를 건너뜀 |
| **리버스 (⇄)** | 게임 진행 방향을 반대로 변경 |
| **드로우 2 (+2)** | 다음 플레이어가 카드 2장을 뽑고 차례를 건너뜀 |
| **와일드 (🎨)** | 원하는 색상으로 변경 가능 |
| **와일드 드로우 4 (+4)** | 다음 플레이어가 카드 4장을 뽑고 색상 변경 |

### 공격 카드 방어
- 드로우 2나 드로우 4 카드로 공격받았을 때
- 같은 공격 카드로 방어 가능 (누적)
- 방어하지 못하면 누적된 모든 카드를 뽑음

## 🛠 기술 스택

### Frontend
- **React 18.2**: UI 라이브러리
- **React Router 6**: 라우팅
- **Framer Motion**: 애니메이션
- **Tailwind CSS**: 스타일링

### Backend & Database
- **Firebase Realtime Database**: 실시간 데이터 동기화
- **Firebase onDisconnect**: 자동 연결 끊김 감지

### State Management
- **Zustand**: 경량 상태 관리

### Build Tools
- **Vite**: 빠른 개발 서버 및 빌드

## 🎨 디자인 특징

### 네온 스타일 컬러 팔레트
- 🔵 Neon Blue: `#00f0ff`
- 🟣 Neon Purple: `#b800e6`
- 🔴 Neon Pink: `#ff00ff`
- 🟢 Neon Green: `#00ff88`
- 🟡 Neon Yellow: `#ffff00`

### 애니메이션
- 카드 드로우 시 포물선 애니메이션
- 부채꼏 모양의 손패 배치
- 네온 펄스 효과
- 부드러운 페이지 전환

## 📱 반응형 디자인

### Desktop (≥768px)
- 좌우 넓은 레이아웃 활용
- 상대방 카드 상단 배치
- 내 카드 하단 부채꼴 배치

### Mobile (<768px)
- 세로/가로 모드 최적화
- 터치 친화적인 카드 크기
- 넓은 부채꼴 각도로 선택 용이

## 🔧 Firebase 보안 규칙 (권장)

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        ".indexOn": ["metadata/status", "metadata/createdAt"]
      }
    }
  }
}
```

## 🚧 향후 계획

- [ ] AI 대전 모드 (싱글 플레이)
- [ ] 채팅 기능
- [ ] 게임 리플레이
- [ ] 통계 및 랭킹 시스템
- [ ] 커스텀 게임 규칙
- [ ] 사운드 효과
- [ ] PWA 지원

## 🤝 기여하기

이슈와 PR은 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 👨‍💻 개발자

**mahyun-dev**

---

⭐ 이 프로젝트가 마음에 드셨다면 스타를 눌러주세요!