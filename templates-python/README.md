# MCP Python 템플릿

이 프로젝트는 Model Context Protocol (MCP) 서버를 Python으로 개발하기 위한 기본 템플릿입니다.

## 기능

- Python으로 구현된 MCP 서버 기본 구조
- FastAPI 기반 HTTP 서버
- 확장 가능한 도구(tool) 시스템
- 환경 변수 관리
- 가상환경 기반 의존성 관리

## 설치

```bash
# 저장소 복제
git clone https://github.com/bigdata-coss/MCPs.git
cd MCPs/templates-python

# 가상 환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# 또는 Windows에서:
# .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

## 가상환경 및 패키지 관리

### 가상환경 관리

Python 가상환경은 프로젝트별로 독립된 Python 환경을 제공하여 의존성 충돌을 방지합니다.

#### 가상환경 생성 방법

```bash
# 기본 venv 모듈 사용
python -m venv .venv

# 또는 virtualenv 사용
pip install virtualenv
virtualenv .venv
```

#### 가상환경 활성화

```bash
# Linux/macOS
source .venv/bin/activate

# Windows - Command Prompt
.venv\Scripts\activate.bat

# Windows - PowerShell
.venv\Scripts\Activate.ps1
```

#### 가상환경 비활성화

```bash
deactivate
```

### 패키지 관리

#### 패키지 설치

```bash
# 단일 패키지 설치
pip install package-name

# 특정 버전 설치
pip install package-name==1.2.3

# requirements.txt에서 설치
pip install -r requirements.txt
```

#### 설치된 패키지 확인

```bash
pip list
```

#### 패키지 업데이트

```bash
pip install --upgrade package-name
```

#### 의존성 파일 생성

```bash
pip freeze > requirements.txt
```

## 사용법

### 서버 실행

```bash
# 서버 실행
python server.py
```

### MCP 구성

#### 기본 구성

VSCode의 설정 내에서 Cline/Claude MCP 설정 파일에 서버를 추가하세요(예: ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json):

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

#### 가상환경을 사용한 구성

가상환경을 사용하여 MCP 서버를 실행하려면 다음과 같이 설정합니다:

```json
{
  "mcpServers": {
    "python-mcp-venv": {
      "command": "/path/to/venv/bin/python",  # Linux/macOS
      # 또는 Windows에서:
      # "command": "E:\\path\\to\\venv\\Scripts\\python.exe",
      "args": [
        "/path/to/MCPs/templates-python/server.py"
      ],
      "env": {
        "VIRTUAL_ENV": "/path/to/venv",
        "PYTHONPATH": "/path/to/venv/lib/python3.x/site-packages",
        # Windows에서는:
        # "VIRTUAL_ENV": "E:\\path\\to\\venv",
        # "PYTHONPATH": "E:\\path\\to\\venv\\Lib\\site-packages",
        # "PATH": "E:\\path\\to\\venv\\Scripts;%PATH%"
      },
      "disabled": false
    }
  }
}
```

### Cursor/Claude 통합

Cursor나 Claude에서 Python 가상환경을 사용하는 MCP 서버를 연결하려면:

1. 위의 가상환경 구성을 사용하여 MCP 설정 파일을 업데이트합니다.
2. 경로는 절대 경로로 지정하는 것이 좋습니다.
3. Windows에서는 백슬래시를 이스케이프하기 위해 이중 백슬래시(`\\`)나 정방향 슬래시(`/`)를 사용하세요.

예시:

```json
{
  "mcpServers": {
    "my-python-mcp": {
      "command": "E:\\codes\\my-project\\venv\\Scripts\\python.exe",
      "args": ["E:\\codes\\my-project\\server.py"],
      "env": {
        "VIRTUAL_ENV": "E:\\codes\\my-project\\venv",
        "PYTHONPATH": "E:\\codes\\my-project\\venv\\Lib\\site-packages",
        "PATH": "E:\\codes\\my-project\\venv\\Scripts;%PATH%"
      }
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