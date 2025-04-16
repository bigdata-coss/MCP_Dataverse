# MCP Python 템플릿

이 프로젝트는 Model Context Protocol (MCP) 서버를 Python으로 개발하기 위한 기본 템플릿입니다.

## 기능

- Python으로 구현된 MCP 서버 기본 구조
- FastAPI 기반 HTTP 서버
- 확장 가능한 도구(tool) 시스템
- 환경 변수 관리

## 설치

```bash
# 저장소 복제
git clone https://github.com/bigdata-coss/MCPs.git
cd MCPs/templates-python

# 가상 환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

## 사용법

### 서버 실행

```bash
# 서버 실행
python server.py
```

### Cline 구성

VSCode의 설정 내에서 Cline MCP 설정 파일에 서버를 추가하세요(예: ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json):

```json
{
  "mcpServers": {
    "python-mcp": {
      "command": "python",
      "args": [
        "/path/to/MCPs/templates-python/server.py"
      ],
      "alwaysAllow": [
        "add"
      ],
      "disabled": false
    }
  }
}
```

### 새로운 도구 추가하기

`server.py` 파일에 새로운 도구 함수를 추가하여 확장할 수 있습니다:

```python
@app.post("/mcp/my_tool")
async def my_tool(request: Request):
    body = await request.json()
    param1 = body.get("param1")
    
    # 도구 구현
    result = f"처리된 매개변수: {param1}"
    
    return {"result": result}
```

그리고 도구 스키마를 등록합니다:

```python
tools = [
    {
        "name": "my_tool",
        "description": "새로운 도구 설명",
        "parameters": {
            "type": "object",
            "properties": {
                "param1": {
                    "type": "string", 
                    "description": "첫 번째 매개변수 설명"
                }
            },
            "required": ["param1"]
        }
    },
    # 기존 도구들...
]
```

## 프로젝트 구조

```
templates-python/
├── server.py         # 메인 서버 파일
├── .venv/            # 가상 환경
├── .python-version   # Python 버전
├── pyproject.toml    # 프로젝트 설정
└── requirements.txt  # 의존성 목록
```

## 라이선스

MIT