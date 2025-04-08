# National Library MCP Server

이 프로젝트는 한국 중앙도서관 API를 Model Context Protocol (MCP)과 통합하는 서버입니다. 이를 통해 AI 모델이 도서관의 도서 정보에 접근하고 검색할 수 있습니다.

## 기능 (예정)

- **도서 검색**: 키워드를 사용하여 도서 검색
- **도서 상세 정보**: 도서 ID를 사용하여 특정 도서의 상세 정보를 조회
- **대출 상태 확인**: 도서의 대출 가능 여부 확인
- **예약 기능**: 도서 예약 및 예약 취소
- **대출 이력 조회**: 사용자의 대출 이력 조회

## 설치

```bash
npm install
```

## 환경 변수 설정

서버를 실행하기 전에 다음 환경 변수를 설정해야 합니다:

- `LIBRARY_API_KEY`: 도서관 API 키 (필수)
- `LIBRARY_API_URL`: 도서관 API URL (선택)

## 실행

```bash
npm start
```

## API 엔드포인트

### 도구 (예정)

- `search`: 도서 검색
- `getBookInfo`: 도서 상세 정보 조회
- `checkAvailability`: 도서 대출 가능 여부 확인
- `reserveBook`: 도서 예약
- `cancelReservation`: 예약 취소
- `getLoanHistory`: 대출 이력 조회

## 라이선스

MIT
