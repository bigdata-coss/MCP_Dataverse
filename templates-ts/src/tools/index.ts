import { HWPService } from '../services/hwp-service.js';
import { 
  CreateDocumentArgs, 
  ReadDocumentArgs, 
  ExtractTextArgs, 
  EditDocumentArgs,
  ConvertMarkdownToHWPArgs,
  ToolResponse 
} from '../types/index.js';
import path from 'path';

// 서비스 초기화
const hwpService = new HWPService({
  defaultSaveDir: process.env.SAVE_DIR || ''
});

export const tools = [
  {
    name: "mcp_hwp_mcp_create_document",
    description: "HWP 문서를 생성합니다",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "문서에 포함할 텍스트 내용"
        },
        saveDir: {
          type: "string",
          description: "생성된 문서를 저장할 디렉토리"
        },
        fileName: {
          type: "string",
          description: "확장자를 제외한 생성된 문서의 기본 파일 이름"
        }
      },
      required: ["content"]
    },
    handler: async (args: CreateDocumentArgs): Promise<ToolResponse> => {
      const result = await hwpService.createDocument(args.content, {
        saveDir: args.saveDir,
        fileName: args.fileName
      });

      if (!result.success) {
        return {
          content: [{
            type: "text",
            text: `문서 생성 오류: ${result.error}`
          }]
        };
      }

      const filePath = result.filePath || '';

      let responseText = `문서가 성공적으로 생성되었습니다.\n\n`;
      responseText += `내용: "${args.content.substring(0, 50)}${args.content.length > 50 ? '...' : ''}"\n\n`;
      responseText += `문서가 저장된 위치:\n`;
      responseText += `- ${filePath}\n`;

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
  },
  {
    name: "mcp_hwp_mcp_read_document",
    description: "HWP 문서를 읽고 텍스트 내용을 반환합니다",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "읽을 HWP 문서의 경로"
        }
      },
      required: ["filePath"]
    },
    handler: async (args: ReadDocumentArgs): Promise<ToolResponse> => {
      // 상대 경로를 절대 경로로 변환
      const filePath = path.isAbsolute(args.filePath) 
        ? args.filePath 
        : path.resolve(process.cwd(), args.filePath);

      const result = await hwpService.readDocument(filePath);

      if (!result.success) {
        return {
          content: [{
            type: "text",
            text: `문서 읽기 오류: ${result.error}`
          }]
        };
      }

      const content = result.content || '';

      let responseText = `문서를 성공적으로 읽었습니다.\n\n`;
      responseText += `파일: ${filePath}\n\n`;
      responseText += `내용:\n${content}\n`;

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
  },
  {
    name: "mcp_hwp_mcp_extract_text",
    description: "HWP 문서에서 텍스트를 추출합니다",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "텍스트를 추출할 HWP 문서의 경로"
        }
      },
      required: ["filePath"]
    },
    handler: async (args: ExtractTextArgs): Promise<ToolResponse> => {
      // 상대 경로를 절대 경로로 변환
      const filePath = path.isAbsolute(args.filePath) 
        ? args.filePath 
        : path.resolve(process.cwd(), args.filePath);

      const result = await hwpService.extractText(filePath);

      if (!result.success) {
        return {
          content: [{
            type: "text",
            text: `텍스트 추출 오류: ${result.error}`
          }]
        };
      }

      const extractedText = result.content || '';

      let responseText = `문서에서 텍스트를 성공적으로 추출했습니다.\n\n`;
      responseText += `파일: ${filePath}\n\n`;
      responseText += `추출된 텍스트:\n${extractedText}\n`;

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
  },
  {
    name: "mcp_hwp_mcp_edit_document",
    description: "기존 HWP 문서를 편집합니다",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "편집할 HWP 문서의 경로"
        },
        edits: {
          type: "array",
          description: "적용할 편집 목록",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "편집 유형 (현재는 'replace'만 지원)"
              },
              target: {
                type: "string",
                description: "찾을 텍스트"
              },
              replacement: {
                type: "string",
                description: "바꿀 텍스트"
              }
            },
            required: ["type", "target", "replacement"]
          }
        },
        saveDir: {
          type: "string",
          description: "편집된 문서를 저장할 디렉토리"
        },
        fileName: {
          type: "string",
          description: "확장자를 제외한 편집된 문서의 기본 파일 이름"
        }
      },
      required: ["filePath", "edits"]
    },
    handler: async (args: EditDocumentArgs): Promise<ToolResponse> => {
      // 상대 경로를 절대 경로로 변환
      const filePath = path.isAbsolute(args.filePath) 
        ? args.filePath 
        : path.resolve(process.cwd(), args.filePath);

      const result = await hwpService.editDocument(filePath, args.edits, {
        saveDir: args.saveDir,
        fileName: args.fileName
      });

      if (!result.success) {
        return {
          content: [{
            type: "text",
            text: `문서 편집 오류: ${result.error}`
          }]
        };
      }

      const editedFilePath = result.filePath || '';
      const editCount = args.edits.length;

      let responseText = `문서가 성공적으로 편집되었습니다. ${editCount}개의 편집을 적용했습니다.\n\n`;
      responseText += `원본 파일: ${filePath}\n`;
      responseText += `편집된 파일: ${editedFilePath}\n\n`;
      
      // 편집 내용 요약
      responseText += `적용된 편집:\n`;
      args.edits.forEach((edit, index) => {
        responseText += `${index + 1}. ${edit.type}: '${edit.target}' → '${edit.replacement}'\n`;
      });

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
  },
  {
    name: "mcp_hwp_mcp_convert_markdown_to_hwp",
    description: "마크다운 텍스트를 HWP 문서로 변환합니다",
    inputSchema: {
      type: "object",
      properties: {
        markdown: {
          type: "string",
          description: "변환할 마크다운 텍스트"
        },
        saveDir: {
          type: "string",
          description: "생성된 문서를 저장할 디렉토리"
        },
        fileName: {
          type: "string",
          description: "확장자를 제외한 생성된 문서의 기본 파일 이름"
        }
      },
      required: ["markdown"]
    },
    handler: async (args: ConvertMarkdownToHWPArgs): Promise<ToolResponse> => {
      const result = await hwpService.convertMarkdownToHWP(args.markdown, {
        saveDir: args.saveDir,
        fileName: args.fileName
      });

      if (!result.success) {
        return {
          content: [{
            type: "text",
            text: `마크다운 변환 오류: ${result.error}`
          }]
        };
      }

      const filePath = result.filePath || '';

      let responseText = `마크다운이 성공적으로 HWP 문서로 변환되었습니다.\n\n`;
      responseText += `원본 마크다운: ${args.markdown.substring(0, 50)}${args.markdown.length > 50 ? '...' : ''}\n\n`;
      responseText += `문서가 저장된 위치:\n`;
      responseText += `- ${filePath}\n`;

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
  }
];
