import { McpServer } from '@anthropic-ai/sdk';

const server = new McpServer({
  name: 'book',
  version: '1.0.0',
  description: '한국 중앙도서관 API를 Model Context Protocol (MCP)과 통합하는 서버',
  capabilities: {
    tools: [
      {
        name: 'search',
        description: '도서 검색',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '검색어'
            },
            page: {
              type: 'number',
              description: '페이지 번호',
              default: 1
            },
            per_page: {
              type: 'number',
              description: '페이지당 결과 수',
              default: 10
            }
          },
          required: ['query']
        }
      }
    ]
  }
});

server.start(); 