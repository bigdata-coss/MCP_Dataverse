# MCP-HWP: 한글 문서 작업을 위한 MCP 서버

이 프로젝트는 한글(HWP) 문서를 프로그래밍 방식으로 생성, 편집, 변환할 수 있는 MCP(Multimodal Command Processor) 서버를 제공합니다.

## 주요 기능

- 마크다운(MD) 문서를 한글(HWP) 문서로 변환
- 한글 문서 생성 및 텍스트 작성
- 한글 문서 내용 읽기 및 표 추출
- 템플릿 기반 한글 문서 생성 (템플릿에 데이터 채우기)

## 설치 방법

```bash
# 가상 환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

## 사용 방법

MCP 서버를 실행하여 API를 통해 한글 문서 관련 작업을 수행할 수 있습니다.

```bash
python server.py
```

## 제공 도구

1. **format_message**: 템플릿에 값을 채워 메시지 생성
2. **md2hwp**: 마크다운 텍스트나 파일을 한글 문서로 변환
3. **hwp_write**: 한글 문서에 내용 작성 또는 템플릿에 데이터 채우기
4. **hwp_read**: 한글 문서 내용 읽기 또는 표 추출

## pyhwpx 라이브러리 정보

이 프로젝트는 **pyhwpx** 라이브러리를 기반으로 구현되었습니다. pyhwpx는 pywin32 패키지를 활용하여 아래아한글(HWP) 문서를 자동화할 수 있는 Python 모듈입니다.

### 기본 요구사항

- **Windows** 환경에서만 작동
- **한글(HWP)** 프로그램이 설치되어 있어야 함
- **Python 3.10** 이상 필요
- **pywin32** 패키지 필요

### 주요 API 및 기능

#### Hwp 클래스 기본 사용

```python
from pyhwpx import Hwp

# 한글 실행 (보안모듈 자동 등록)
hwp = Hwp(visible=True)  # visible=True: 한글 화면 표시

# 텍스트 삽입
hwp.insert_text("Hello world!")

# 문서 저장
hwp.save_as("./example.hwp")

# 한글 종료
hwp.quit()
```

#### 문서 다루기

- **새 문서 생성**: `XHwpDocuments.Add(isTab=False)`
- **문서 열기**: `HAction.Execute("FileOpen", 파일경로)` 
- **문서 저장**: `save_as(파일경로)` 또는 `HAction.Execute("FileSave", "")`
- **문서 닫기**: `HAction.Execute("FileClose", "")`

#### 텍스트 작업

- **텍스트 삽입**: `insert_text(문자열)`
- **글꼴 변경**: `set_font_name(폰트명)`, `set_font_size(크기)`, `set_font_bold(True/False)`
- **단락 삽입**: `insert_paragraph()`

#### 표 작업

- **표 생성**: `create_table(행, 열)`
- **표 데이터 설정**: `set_table_cell_text(행인덱스, 열인덱스, 내용)`
- **표를 DataFrame으로**: `table_to_df(표인덱스, cols=열인덱스)`
- **표를 CSV로 저장**: `table_to_csv(표인덱스, 파일명)`

#### 이미지 작업

- **이미지 삽입**: `insert_picture(이미지경로, width=너비, height=높이)`

### 주의사항

- pyhwpx는 COM 인터페이스를 통해 한글 프로그램을 제어하는 방식으로 작동합니다.
- 파일 작업 시 절대 경로 사용을 권장합니다.
- COM 객체 작업 시 오류가 발생할 수 있으며, 이를 적절히 처리해야 합니다.
- 서버 환경에서 사용 시 한글 프로그램의 인스턴스 관리에 주의해야 합니다.

## 예제

### 마크다운을 한글 문서로 변환

```python
# 마크다운 텍스트를 한글 문서로 변환
md_content = """
# 제목
## 부제목
- 항목 1
- 항목 2

| 헤더1 | 헤더2 |
|-------|-------|
| 셀1   | 셀2   |
"""
md2hwp(markdown_content=md_content, output_file="output.hwp")

# 마크다운 파일을 한글 문서로 변환
md2hwp(markdown_file="input.md", output_file="output.hwp")
```

### 한글 문서 작성

```python
# 새 한글 문서에 텍스트 작성
hwp_write(file_path="document.hwp", content="안녕하세요, 한글 문서입니다.")

# 템플릿에 데이터 채우기
data = {
    "title": "보고서",
    "author": "홍길동",
    "date": "2024-05-25"
}
hwp_write(file_path="output.hwp", template_file="template.hwp", data=data)
```

### 한글 문서 읽기

```python
# 한글 문서 내용 읽기
content = hwp_read(file_path="document.hwp")

# 섹션별로 읽기
sections = hwp_read(file_path="document.hwp", by_section=True)

# 표 추출
tables = hwp_read(file_path="document.hwp", extract_tables=True)
```

## 참조 링크

본 프로젝트는 다음의 오픈소스 프로젝트를 기반으로 개발되었습니다:

- [pyhwpx](https://github.com/martiniifun/pyhwpx): 파이썬에서 한글 문서를 다루기 위한 라이브러리
  - [pyhwpx API 문서](https://martiniifun.github.io/pyhwpx/api.html): 상세 API 레퍼런스
- [FastMCP](https://github.com/microsoft/FastMCP): 마이크로소프트의 Multimodal Command Processor 구현체

## 라이센스

MIT License
