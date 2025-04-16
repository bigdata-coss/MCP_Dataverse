# MCP Servers Collection

이 저장소는 다양한 MCP 서버들의 모음입니다.

## 서버 목록

### 1. Dataverse MCP Server
- Harvard Dataverse API를 Model Context Protocol (MCP)과 통합하는 서버
- 데이터셋 검색, 다운로드, 큐레이션 레이블 관리 기능 제공
- [자세히 보기](./dataverse/README.md)

### 2. National Library MCP Server
- 한국 중앙도서관 API를 Model Context Protocol (MCP)과 통합하는 서버
- 도서 검색, 대출, 예약 기능 제공
- [자세히 보기](./book/README.md)

### 3. Ontology MCP Server
- 온톨로지 기반 지식그래프를 Model Context Protocol (MCP)과 통합하는 서버
- SPARQL 쿼리를 통한 지식 검색 및 추론 기능 제공
- [자세히 보기](./ontology_mcp/README.md)

### 4. HWP MCP Server
- 한글 문서(HWP)를 처리하는 Model Context Protocol (MCP) 서버
- HWP 문서 파싱, 내용 추출 및 변환 기능 제공
- [자세히 보기](./hwp/mcp-hwp/README.md)

### 5. DALL-E MCP Server
- OpenAI의 DALL-E를 Model Context Protocol (MCP)로 통합하는 서버
- 이미지 생성, 편집, 변형 기능 제공
- [자세히 보기](./Dall-E/README.md)

## 템플릿

개발자를 위한 MCP 서버 템플릿:

- [TypeScript 템플릿](./templates-ts/README.md) - TypeScript로 MCP 서버를 개발하기 위한 기본 템플릿
- [Python 템플릿](./templates-python/README.md) - Python으로 MCP 서버를 개발하기 위한 기본 템플릿

## 설치 및 실행

각 서버의 설치 및 실행 방법은 해당 폴더의 README.md 파일을 참조하세요.

## 라이선스

MIT 