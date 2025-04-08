import { McpServer } from '@anthropic-ai/sdk';
import axios from 'axios';
import { SparqlClient } from 'sparql-http-client';

const BASE_URL = 'https://lod.nl.go.kr/home/tutorial/json/openapi.do';

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
            type: {
              type: 'string',
              description: '검색 유형 (bibo:Book, nlon:Author, nlon:Concept, nlon:OnlineMaterial)',
              enum: ['bibo:Book', 'nlon:Author', 'nlon:Concept', 'nlon:OnlineMaterial']
            },
            field: {
              type: 'string',
              description: '검색 필드 (dcterms:title, bibo:isbn, foaf:name 등)',
              enum: ['dcterms:title', 'bibo:isbn', 'foaf:name']
            },
            keywords: {
              type: 'string',
              description: '검색어'
            },
            limit: {
              type: 'number',
              description: '결과 최대값 (10 이하)',
              default: 5
            },
            start: {
              type: 'number',
              description: '결과 반환 시작값',
              default: 1
            }
          },
          required: ['type', 'field', 'keywords']
        },
        handler: async (params: any) => {
          try {
            const response = await axios.get(BASE_URL, {
              params: {
                type: params.type,
                field: params.field,
                keywords: params.keywords,
                limit: params.limit || 5,
                start: params.start || 1
              }
            });
            return response.data;
          } catch (error) {
            console.error('Error searching books:', error);
            throw new Error('Failed to search books');
          }
        }
      },
      {
        name: 'sparqlQuery',
        description: 'SPARQL 쿼리 실행',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SPARQL 쿼리'
            }
          },
          required: ['query']
        },
        handler: async (params: any) => {
          try {
            const client = new SparqlClient({
              endpointUrl: 'https://lod.nl.go.kr/sparql'
            });
            const response = await client.query.select(params.query);
            return response;
          } catch (error) {
            console.error('Error executing SPARQL query:', error);
            throw new Error('Failed to execute SPARQL query');
          }
        }
      }
    ]
  }
});

server.start(); 