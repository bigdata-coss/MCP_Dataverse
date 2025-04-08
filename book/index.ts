import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios, { AxiosError } from 'axios';
import { z } from "zod";

console.error('Starting Book MCP server...');

const BASE_URL = 'https://lod.nl.go.kr/home/tutorial/json/openapi.do';
const SPARQL_ENDPOINT = 'https://lod.nl.go.kr/sparql';

// Create an MCP server
const server = new McpServer({
  name: "Book",
  version: "1.0.0"
});

// Add book resource
server.resource(
  "book",
  new ResourceTemplate("book://{type}/{field}/{keywords}", {
    list: async () => {
      return {
        resources: [
          {
            name: "소나무 관련 도서",
            uri: "book://bibo:Book/dcterms:title/소나무",
            description: "소나무와 관련된 도서 목록"
          },
          {
            name: "현진건 작가의 도서",
            uri: "book://nlon:Author/foaf:name/현진건",
            description: "현진건 작가의 도서 목록"
          }
        ]
      };
    }
  }),
  async (uri, { type, field, keywords }) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: { type, field, keywords }
      });
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error) {
      console.error('Error fetching book resource:', error);
      throw new Error('Failed to fetch book resource');
    }
  }
);

// Add book prompt
server.prompt(
  "book",
  { 
    type: z.enum(['bibo:Book', 'nlon:Author', 'nlon:Concept', 'nlon:OnlineMaterial']),
    field: z.enum(['dcterms:title', 'bibo:isbn', 'foaf:name']),
    keywords: z.string()
  },
  ({ type, field, keywords }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `도서 정보를 검색합니다. 유형: ${type}, 필드: ${field}, 키워드: ${keywords}`
      }
    }]
  })
);

// Add search tool
server.tool(
  "book_search",
  {
    type: z.enum(['bibo:Book', 'nlon:Author', 'nlon:Concept', 'nlon:OnlineMaterial']),
    field: z.enum(['dcterms:title', 'bibo:isbn', 'foaf:name']),
    keywords: z.string(),
    limit: z.number().min(1).max(10).optional(),
    start: z.number().min(1).optional()
  },
  async ({ type, field, keywords, limit = 5, start = 1 }) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          type,
          field,
          keywords,
          limit,
          start
        }
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error) {
      console.error('Error searching books:', error);
      return {
        content: [{
          type: "text",
          text: `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }],
        isError: true
      };
    }
  }
);

// Add SPARQL query tool
server.tool(
  "sparqlQuery",
  {
    query: z.string()
  },
  async ({ query }) => {
    try {
      // Add default prefixes
      const prefixes = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX bibo: <http://purl.org/ontology/bibo/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX nlon: <http://nationallibraryofnetherlands.nl/terms/>
      `;
      
      const fullQuery = `${prefixes}\n${query}`;
      
      const response = await axios.get(SPARQL_ENDPOINT, {
        params: {
          query: fullQuery,
          format: 'json'
        },
        headers: {
          'Accept': 'application/sparql-results+json'
        }
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Error executing SPARQL query:', error);
      if (error instanceof AxiosError && error.response?.data) {
        return {
          content: [{
            type: "text",
            text: `SPARQL 쿼리 실행 중 오류가 발생했습니다:\n${JSON.stringify(error.response.data, null, 2)}`
          }],
          isError: true
        };
      }
      return {
        content: [{
          type: "text",
          text: `SPARQL 쿼리 실행 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }],
        isError: true
      };
    }
  }
);

// Add resources list tool
server.tool(
  "resources_list",
  {},
  async () => {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          resources: [
            { name: "book", template: "book://{type}/{field}/{keywords}" }
          ]
        }, null, 2)
      }]
    };
  }
);

// Add prompts list tool
server.tool(
  "prompts_list",
  {},
  async () => {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          prompts: []
        }, null, 2)
      }]
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Server connected to transport'); 