export interface ToolContent {
  type: "text";
  text: string;
}

export interface ToolResponse {
  content: ToolContent[];
  [key: string]: any; // Allow additional properties for MCP SDK compatibility
}

export interface CreateDocumentArgs {
  content: string;
  saveDir?: string;
  fileName?: string;
}

export interface ReadDocumentArgs {
  filePath: string;
}

export interface ExtractTextArgs {
  filePath: string;
}

export interface EditArgs {
  type: string;
  target: string;
  replacement: string;
}

export interface EditDocumentArgs {
  filePath: string;
  edits: EditArgs[];
  saveDir?: string;
  fileName?: string;
}

export interface ConvertMarkdownToHWPArgs {
  markdown: string;
  saveDir?: string;
  fileName?: string;
}

export type ToolArgs = CreateDocumentArgs | ReadDocumentArgs | ExtractTextArgs | EditDocumentArgs | ConvertMarkdownToHWPArgs;

export interface Tool<T = any> {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
  handler: (args: T) => Promise<ToolResponse>;
}

export interface ListToolsResponse {
  tools: Array<{
    name: string;
    description: string;
    inputSchema: Tool["inputSchema"];
  }>;
}

export interface DocumentResult {
  success: boolean;
  error?: string;
  filePath?: string;
  content?: string;
}
