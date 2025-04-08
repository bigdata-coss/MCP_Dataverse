# Dataverse MCP Server

이 프로젝트는 Harvard Dataverse API를 Model Context Protocol (MCP)과 통합하는 서버입니다. 이를 통해 AI 모델이 Dataverse의 데이터셋에 접근하고 검색할 수 있습니다.

## 기능

- **데이터셋 검색**: 키워드를 사용하여 데이터셋 또는 파일 검색
- **데이터셋 조회**: 데이터셋 ID를 사용하여 특정 데이터셋의 상세 정보를 조회
- **데이터셋 다운로드**: 데이터셋의 모든 파일을 다운로드
- **파일 다운로드**: 특정 파일을 다양한 형식으로 다운로드
- **큐레이션 레이블 관리**: 데이터셋의 큐레이션 상태를 관리

## 설치

```bash
npm install
```

## 환경 변수 설정

서버를 실행하기 전에 다음 환경 변수를 설정해야 합니다:

- `DATAVERSE_API_KEY`: Dataverse API 키 (필수)
- `DATAVERSE_API_URL`: Dataverse API URL (선택, 기본값: https://dataverse.harvard.edu/api/)

## 실행

```bash
npm start
```

## API 엔드포인트

### 도구

- `search`: 데이터셋 또는 파일 검색
  - 매개변수:
    - `query`: 검색어 (문자열)
    - `type`: 검색 유형 ("dataset" 또는 "file", 기본값: "dataset")
    - `per_page`: 페이지당 결과 수 (1-100, 기본값: 10)

- `downloadDataset`: 데이터셋의 모든 파일 다운로드
  - 매개변수:
    - `datasetId`: 데이터셋 ID 또는 DOI (문자열)
    - `version`: 다운로드할 버전 (선택, 기본값: 최신 버전)
    - `format`: 파일 형식 ("original" 또는 "archival", 기본값: "archival")
    - `usePid`: DOI 사용 여부 (선택, 기본값: false)

- `downloadFile`: 특정 파일 다운로드
  - 매개변수:
    - `fileId`: 파일 ID 또는 DOI (문자열)
    - `format`: 파일 형식 ("original", "RData", "prep", "subset", 선택)
    - `variables`: 다운로드할 변수 목록 (선택, "subset" 형식일 때만 사용)
    - `usePid`: DOI 사용 여부 (선택, 기본값: false)

- `getCurationLabel`: 데이터셋의 큐레이션 레이블 조회
  - 매개변수:
    - `datasetId`: 데이터셋 ID 또는 DOI (문자열)
    - `usePid`: DOI 사용 여부 (선택, 기본값: false)

- `setCurationLabel`: 데이터셋의 큐레이션 레이블 설정
  - 매개변수:
    - `datasetId`: 데이터셋 ID 또는 DOI (문자열)
    - `label`: 설정할 레이블 (문자열)
    - `usePid`: DOI 사용 여부 (선택, 기본값: false)

- `deleteCurationLabel`: 데이터셋의 큐레이션 레이블 삭제
  - 매개변수:
    - `datasetId`: 데이터셋 ID 또는 DOI (문자열)
    - `usePid`: DOI 사용 여부 (선택, 기본값: false)

### 리소스

- `dataverse://dataset/{id}`: 데이터셋 ID로 특정 데이터셋 조회

## 오류 처리

서버는 다음과 같은 오류 상황을 처리합니다:

- API 키 누락
- API 요청 실패
- 잘못된 데이터셋 ID
- 검색 매개변수 오류
- 큐레이션 레이블 설정 오류
- 파일 다운로드 오류

## 라이선스

MIT 