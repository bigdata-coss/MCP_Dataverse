#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { tools } from "./tools/index.js";
import { Tool, ToolResponse, CreateDocumentArgs, ReadDocumentArgs, ExtractTextArgs, EditDocumentArgs, ConvertMarkdownToHWPArgs } from "./types/index.js";

// MCP 서버 초기화
const server = new Server(
  {
    name: "hwp-document-handler",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        mcp_hwp_mcp_create_document: true,
        mcp_hwp_mcp_read_document: true,
        mcp_hwp_mcp_extract_text: true,
        mcp_hwp_mcp_edit_document: true,
        mcp_hwp_mcp_convert_markdown_to_hwp: true
      },
    },
  }
);

/**
 * 사용 가능한 도구를 나열하는 핸들러
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }))
}));

/**
 * 도구 호출을 처리하는 핸들러
 */
server.setRequestHandler(CallToolRequestSchema, async (request, _extra) => {
  try {
    const tool = tools.find(t => t.name === request.params.name);
    if (!tool) {
      return {
        content: [{
          type: "text" as const,
          text: `알 수 없는 도구: ${request.params.name}`
        }]
      } as ToolResponse;
    }

    // 도구가 인수를 필요로 하는 경우에만 인수 유효성 검사
    if (tool.inputSchema.required && tool.inputSchema.required.length > 0) {
      const args = request.params.arguments || {};
      const missingArgs = tool.inputSchema.required.filter(
        arg => !(arg in args)
      );
      if (missingArgs.length > 0) {
        return {
          content: [{
            type: "text" as const,
            text: `필수 인수가 누락되었습니다: ${missingArgs.join(', ')}`
          }]
        } as ToolResponse;
      }
    }

    // 도구 이름을 기반으로 적절한 인수 유형으로 도구 실행
    let response: ToolResponse;
    const args = request.params.arguments || {};
    
    switch (tool.name) {
      case 'mcp_hwp_mcp_create_document':
        response = await (tool as Tool<CreateDocumentArgs>).handler(args as unknown as CreateDocumentArgs);
        break;
      case 'mcp_hwp_mcp_read_document':
        response = await (tool as Tool<ReadDocumentArgs>).handler(args as unknown as ReadDocumentArgs);
        break;
      case 'mcp_hwp_mcp_extract_text':
        response = await (tool as Tool<ExtractTextArgs>).handler(args as unknown as ExtractTextArgs);
        break;
      case 'mcp_hwp_mcp_edit_document':
        response = await (tool as Tool<EditDocumentArgs>).handler(args as unknown as EditDocumentArgs);
        break;
      case 'mcp_hwp_mcp_convert_markdown_to_hwp':
        response = await (tool as Tool<ConvertMarkdownToHWPArgs>).handler(args as unknown as ConvertMarkdownToHWPArgs);
        break;
      default:
        throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구: ${tool.name}`);
    }

    // 메타데이터가 제공된 경우 추가
    if (request.params._meta) {
      return {
        ...response,
        _meta: request.params._meta
      };
    }

    return response;

  } catch (error) {
    console.error('도구 실행 오류:', error);
    return {
      content: [{
        type: "text" as const,
        text: error instanceof Error ? error.message : '예기치 않은 오류가 발생했습니다'
      }]
    } as ToolResponse;
  }
}) as any; // MCP SDK 호환성을 위한 타입 단언

/**
 * 서버 시작
 */
async function main() {
  // 환경 변수 검증
  if (!process.env.SAVE_DIR) {
    console.warn('SAVE_DIR 환경 변수가 설정되지 않았습니다. 현재 디렉토리가 사용됩니다.');
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HWP MCP 서버가 stdio에서 실행 중입니다');
}

main().catch((error) => {
  console.error("서버 오류:", error);
  process.exit(1);
});
