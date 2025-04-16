import { SparqlService } from '../services/sparql-service.js';
import { 
  ExecuteQueryArgs, 
  ListRepositoriesArgs, 
  ListGraphsArgs, 
  GetResourceInfoArgs,
  UpdateQueryArgs
} from '../types/index.js';

// 서비스 초기화
const sparqlService = new SparqlService();

// 도구 정의
export const tools = [
  {
    name: 'mcp_sparql_execute_query',
    description: 'SPARQL 쿼리를 실행하고 결과를 반환합니다',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '실행할 SPARQL 쿼리'
        },
        repository: {
          type: 'string',
          description: '쿼리를 실행할 리포지토리 이름'
        },
        endpoint: {
          type: 'string',
          description: 'SPARQL 엔드포인트 URL'
        },
        format: {
          type: 'string',
          enum: ['json', 'xml', 'csv', 'tsv'],
          description: '결과 형식(json, xml, csv, tsv)'
        },
        explain: {
          type: 'boolean',
          description: '쿼리 실행 계획 반환 여부'
        }
      },
      required: ['query']
    },
    async handler(args: ExecuteQueryArgs) {
      try {
        const result = await sparqlService.executeQuery(args.query, args.repository, args.format);
        
        // 결과를 서식화하여 반환
        return {
          content: [{
            type: 'text',
            text: typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString()
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `쿼리 실행 오류: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  },
  {
    name: 'mcp_sparql_update',
    description: 'SPARQL 업데이트 쿼리를 실행하여 데이터를 수정합니다. INSERT DATA, DELETE DATA, INSERT-WHERE, DELETE-WHERE 등의 SPARQL 1.1 Update 문법을 지원합니다. 새로운 트리플 추가, 기존 트리플 삭제, 조건부 데이터 변경 등 다양한 그래프 수정 작업을 수행할 수 있습니다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '실행할 SPARQL 업데이트 쿼리 (예: INSERT DATA { <subject> <predicate> <object> })'
        },
        repository: {
          type: 'string',
          description: '업데이트 쿼리를 실행할 리포지토리 이름'
        },
        endpoint: {
          type: 'string',
          description: 'SPARQL 엔드포인트 URL'
        }
      },
      required: ['query']
    },
    async handler(args: UpdateQueryArgs) {
      try {
        if (args.endpoint) {
          const service = new SparqlService({
            endpoint: args.endpoint,
            defaultRepository: args.repository || ''
          });
          const result = await service.updateQuery(args.query, args.repository);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } else {
          const result = await sparqlService.updateQuery(args.query, args.repository);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `업데이트 쿼리 실행 오류: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  },
  {
    name: 'mcp_sparql_list_repositories',
    description: 'GraphDB 서버의 모든 리포지토리를 나열합니다',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          description: 'SPARQL 엔드포인트 URL'
        }
      },
      required: []
    },
    async handler(args: ListRepositoriesArgs) {
      try {
        if (args.endpoint) {
          const service = new SparqlService({ endpoint: args.endpoint });
          const repositories = await service.listRepositories();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(repositories, null, 2)
            }]
          };
        } else {
          const repositories = await sparqlService.listRepositories();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(repositories, null, 2)
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `리포지토리 목록 조회 오류: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  },
  {
    name: 'mcp_sparql_list_graphs',
    description: '지정된 리포지토리의 모든 명명된 그래프를 나열합니다',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: '그래프를 조회할 리포지토리 이름'
        },
        endpoint: {
          type: 'string',
          description: 'SPARQL 엔드포인트 URL'
        }
      },
      required: []
    },
    async handler(args: ListGraphsArgs) {
      try {
        if (args.endpoint) {
          const service = new SparqlService({
            endpoint: args.endpoint,
            defaultRepository: args.repository || ''
          });
          const graphs = await service.listGraphs(args.repository);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(graphs, null, 2)
            }]
          };
        } else {
          const graphs = await sparqlService.listGraphs(args.repository);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(graphs, null, 2)
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `그래프 목록 조회 오류: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  },
  {
    name: 'mcp_sparql_get_resource_info',
    description: '지정된 URI에 대한 모든 속성과 값을 조회합니다',
    inputSchema: {
      type: 'object',
      properties: {
        uri: {
          type: 'string',
          description: '조회할 리소스의 URI'
        },
        repository: {
          type: 'string',
          description: '조회할 리포지토리 이름'
        },
        endpoint: {
          type: 'string',
          description: 'SPARQL 엔드포인트 URL'
        }
      },
      required: ['uri']
    },
    async handler(args: GetResourceInfoArgs) {
      try {
        if (args.endpoint) {
          const service = new SparqlService({
            endpoint: args.endpoint,
            defaultRepository: args.repository || ''
          });
          const resourceInfo = await service.getResourceInfo(args.uri, args.repository);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(resourceInfo, null, 2)
            }]
          };
        } else {
          const resourceInfo = await sparqlService.getResourceInfo(args.uri, args.repository);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(resourceInfo, null, 2)
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `리소스 정보 조회 오류: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  }
];
