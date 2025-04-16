# MCP TypeScript 템플릿

이 프로젝트는 Model Context Protocol (MCP) 서버를 TypeScript로 개발하기 위한 기본 템플릿입니다.

## 기능

- TypeScript로 구현된 MCP 서버 기본 구조
- 확장 가능한 도구(tool) 시스템
- 테스트 환경 구성
- 환경 변수 관리

## 설치

```bash
# 저장소 복제
git clone https://github.com/bigdata-coss/MCPs.git
cd MCPs/templates-ts

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build
```

## 사용법

### 서버 실행

```bash
# 서버 실행
node build/index.js
```

### Cline 구성

VSCode의 설정 내에서 Cline MCP 설정 파일에 서버를 추가하세요(예: ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json):

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/mcp-server/build/index.js"],
      "env": {
        "CUSTOM_VAR": "value"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 새로운 도구 추가하기

`src/tools` 디렉토리에 새 파일을 생성하여 새로운 도구를 추가할 수 있습니다:

```typescript
// src/tools/myTool.ts
import { Tool } from '../types';

// 도구 정의
export const myTool: Tool = {
  name: 'my_tool',
  description: '새로운 도구 설명',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: '첫 번째 매개변수 설명'
      }
    },
    required: ['param1']
  },
  execute: async (params) => {
    // 도구 구현
    const { param1 } = params;
    
    // 결과 반환
    return {
      result: `처리된 매개변수: ${param1}`
    };
  }
};
```

그런 다음 `src/tools/index.ts`에 도구를 등록합니다:

```typescript
export { myTool } from './myTool';
```

## 개발

### 테스트 구성

테스트를 실행하려면 루트 디렉토리에 `.env` 파일을 생성하세요:

```
# 환경 변수 설정
CUSTOM_VAR=test_value
```

### 테스트 실행

```bash
# 기본 테스트 실행
npm test

# 감시 모드에서 테스트 실행
npm run test:watch
```

## 프로젝트 구조

```
templates-ts/
├── src/                # 소스 코드
│   ├── tools/          # MCP 도구 구현
│   ├── types.ts        # 타입 정의
│   └── index.ts        # 진입점
├── tests/              # 테스트 파일
├── .env                # 환경 변수
└── mcp-settings-example.json # MCP 설정 예제
```

## 라이선스

MIT
