/**
 * 마크다운에서 HWP 파일로 변환하는 라이브러리
 * hwp.js 분석을 기반으로 역변환 구현
 */

import * as marked from 'marked';
import * as fs from 'fs';
import * as path from 'path';
import { generateHWPBinary } from './hwp-binary-generator.js';

// 테이블 토큰 타입 정의
interface TableToken {
  type: 'table';
  header: any[];
  align: (string | null)[];
  rows: any[][];
}

// HWP 문서 구조 정의 (hwp.js의 HWPDocument 참조)
interface HWPDocument {
  header: {
    version: {
      major: number;
      minor: number;
      build: number;
      revision: number;
    };
    signature: string;
  };
  info: any;
  sections: HWPSection[];
}

// HWP 섹션 정의
interface HWPSection {
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  headerPadding: number;
  content: any[]; // 다양한 유형의 콘텐츠를 담을 수 있도록 any[] 사용
}

// HWP 문단 정의
interface HWPParagraph {
  type: string;
  text: string;
  shapeIndex: number;
  shapeBuffer: {
    pos: number;
    shapeIndex: number;
  }[];
  controls?: any[]; // 테이블 등의 컨트롤 객체
  paraShapeId?: number; // 문단 모양 ID
  indent?: number; // 들여쓰기 크기
  align?: string; // 정렬 방식 (left, center, right, justify)
  margin?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

// HWP 테이블 제어 객체 정의 (hwp.js의 TableControl 참조)
interface TableControl {
  type: string;
  width: number;
  height: number;
  cellPadding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  borderFillID: number;
  rows: TableRow[];
}

// 테이블 행 정의
interface TableRow {
  cells: TableCell[];
}

// 테이블 셀 정의
interface TableCell {
  content: string;
  width: number;
  height: number;
  colSpan: number;
  rowSpan: number;
  borderFillID?: number;
  align?: string;
}

// ListItem 인터페이스 추가
interface ListItem {
  text: string;
  level: number;
  ordered: boolean;
  index?: number;
}

/**
 * 마크다운 → HWP 변환 클래스
 */
export class MarkdownToHWP {
  private document: HWPDocument;
  
  constructor() {
    // 기본 빈 HWP 문서 구조 생성
    this.document = {
      header: {
        version: {
          major: 5,
          minor: 0,
          build: 0,
          revision: 0
        },
        signature: 'HWP Document File'
      },
      info: {
        // HWP 문서 정보
        borderFills: [], // 테두리/배경 정보
        charShapes: [],  // 글자 모양 정보
        fontFaces: []    // 글꼴 정보
      },
      sections: []       // 구역 정보
    };
    
    // 기본 폰트 정보 추가
    this.initDefaultStyles();
  }
  
  /**
   * 기본 스타일 초기화
   */
  private initDefaultStyles() {
    // 기본 폰트 추가
    this.document.info.fontFaces = [
      {
        name: '맑은 고딕',
        getFontFamily: () => '맑은 고딕, Malgun Gothic, sans-serif'
      }
    ];
    
    // 기본 글자 모양 추가
    this.document.info.charShapes = [
      {
        fontId: [0, 0],        // 글꼴 ID (한글, 영문)
        fontBaseSize: 10,      // 글자 크기
        fontRatio: [100, 100], // 장평 (가로, 세로)
        color: [0, 0, 0]       // RGB 색상
      }
    ];
    
    // 기본 테두리/배경 추가
    this.document.info.borderFills = [
      {
        style: {
          top: { type: 1, width: 7, color: [0, 0, 0] },    // solid, 0.5mm
          right: { type: 1, width: 7, color: [0, 0, 0] },  // solid, 0.5mm
          bottom: { type: 1, width: 7, color: [0, 0, 0] }, // solid, 0.5mm
          left: { type: 1, width: 7, color: [0, 0, 0] }    // solid, 0.5mm
        },
        backgroundColor: [255, 255, 255]  // 흰색 배경
      },
      {
        // 헤더용 배경색 스타일
        style: {
          top: { type: 1, width: 7, color: [0, 0, 0] },    
          right: { type: 1, width: 7, color: [0, 0, 0] },  
          bottom: { type: 1, width: 7, color: [0, 0, 0] }, 
          left: { type: 1, width: 7, color: [0, 0, 0] }    
        },
        backgroundColor: [242, 242, 242]  // 연한 회색 배경 (#f2f2f2)
      }
    ];
  }
  
  /**
   * 마크다운 텍스트 파싱
   */
  parseMarkdown(markdownText: string) {
    const tokens = marked.lexer(markdownText);
    console.log(`마크다운 파싱 결과: ${tokens.length}개 토큰`);
    
    // 문서 구역(section) 생성
    const section: HWPSection = {
      width: 210 * 7200 / 25.4,     // A4 너비 (mm → hwpunit)
      height: 297 * 7200 / 25.4,    // A4 높이 (mm → hwpunit)
      paddingLeft: 20 * 7200 / 25.4, // 왼쪽 여백 (mm → hwpunit)
      paddingRight: 20 * 7200 / 25.4, // 오른쪽 여백 (mm → hwpunit)
      paddingTop: 15 * 7200 / 25.4,  // 위쪽 여백 (mm → hwpunit)
      paddingBottom: 15 * 7200 / 25.4, // 아래쪽 여백 (mm → hwpunit)
      headerPadding: 0,              // 머리글 여백
      content: []                   // 내용 (문단, 표 등)
    };
    
    // 토큰 처리
    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          section.content.push(this.convertHeading(token));
          break;
        case 'paragraph':
          section.content.push(this.convertParagraph(token));
          break;
        case 'table':
          section.content.push(this.convertTable(token as TableToken));
          break;
        case 'list':
          // 목록 처리 - 여러 문단 반환 가능
          const listParagraphs = this.convertList(token);
          section.content.push(...listParagraphs);
          break;
        // 기타 토큰 타입 처리 추가 가능
      }
    }
    
    // 문서에 구역 추가
    this.document.sections.push(section);
    
    // 문단 스타일 정보 추가 (들여쓰기, 정렬 등)
    this.initParagraphStyles();
    
    return this;
  }
  
  /**
   * 제목 변환
   */
  private convertHeading(token: any): HWPParagraph {
    // 제목 수준에 따른 스타일 설정
    let fontSize, align;
    
    switch (token.depth) {
      case 1: // h1
        fontSize = 22;
        align = 'center';
        break;
      case 2: // h2
        fontSize = 16;
        align = 'left';
        break;
      default: // h3-h6
        fontSize = 14;
        align = 'left';
        break;
    }
    
    return {
      type: 'paragraph',
      text: token.text,
      shapeIndex: 0,
      shapeBuffer: [
        {
          pos: 0,
          shapeIndex: token.depth // 제목 수준에 따른 스타일 인덱스
        }
      ],
      paraShapeId: 0, // 기본 문단 모양
      align: align,
      // 제목 후 약간의 공백 추가
      margin: {
        bottom: 10
      }
    };
  }
  
  /**
   * 단락 변환
   */
  private convertParagraph(token: any): HWPParagraph {
    return {
      type: 'paragraph',
      text: token.text,
      shapeIndex: 0, // 기본 글자 모양
      shapeBuffer: [
        {
          pos: 0,
          shapeIndex: 0
        }
      ],
      paraShapeId: 0, // 기본 문단 모양
      align: 'justify' // 양쪽 정렬
    };
  }
  
  /**
   * 목록 변환
   */
  private convertList(token: any): HWPParagraph[] {
    const paragraphs: HWPParagraph[] = [];
    const ordered = token.ordered || false;
    
    // 목록 아이템 추출 및 가공
    const processListItems = (items: any[], level: number = 0, startIndex: number = 1): ListItem[] => {
      const result: ListItem[] = [];
      
      items.forEach((item, idx) => {
        // 텍스트 추출
        let itemText = '';
        if (typeof item.text === 'string') {
          itemText = item.text;
        } else if (item.tokens) {
          // 텍스트 토큰 찾기
          const textTokens = item.tokens.filter((t: any) => t.type === 'text' || t.type === 'paragraph');
          itemText = textTokens.map((t: any) => t.text || '').join(' ').trim();
        }
        
        // 목록 아이템 추가
        result.push({
          text: itemText,
          level,
          ordered,
          index: ordered ? startIndex + idx : undefined
        });
        
        // 중첩 목록 처리
        const nestedList = item.tokens?.find((t: any) => t.type === 'list');
        if (nestedList) {
          const nestedItems = processListItems(
            nestedList.items, 
            level + 1, 
            nestedList.ordered ? startIndex + idx : undefined
          );
          result.push(...nestedItems);
        }
      });
      
      return result;
    };
    
    // 목록 아이템 처리
    const listItems = processListItems(token.items);
    
    // 각 아이템을 HWP 문단으로 변환
    listItems.forEach(item => {
      // 들여쓰기 계산 (레벨당 20pt)
      const indentSize = item.level * 20;
      
      // 목록 기호 또는 번호
      let prefix = '';
      if (item.ordered && item.index !== undefined) {
        prefix = `${item.index}. `;
      } else {
        // 레벨에 따라 다른 글머리 기호 사용
        const bullets = ['•', '◦', '▪', '▫'];
        prefix = `${bullets[item.level % bullets.length]} `;
      }
      
      // HWP 문단 생성
      paragraphs.push({
        type: 'paragraph',
        text: prefix + item.text,
        shapeIndex: 0,
        shapeBuffer: [
          {
            pos: 0,
            shapeIndex: 0
          }
        ],
        // 들여쓰기 및 정렬 정보
        paraShapeId: item.level + 1, // 레벨에 따른 문단 스타일
        indent: indentSize,
        align: 'left'
      });
    });
    
    return paragraphs;
  }
  
  /**
   * 링크 변환
   */
  private convertLink(token: any): string {
    // 링크 텍스트와 URL 추출
    const text = token.text || '';
    const href = token.href || '';
    
    // 텍스트가 없으면 URL만 반환
    if (!text) {
      return href;
    }
    
    // 텍스트와 URL이 같으면 텍스트만 반환
    if (text === href) {
      return text;
    }
    
    // 텍스트(URL) 형식으로 반환
    return `${text}(${href})`;
  }
  
  /**
   * 테이블 변환 (핵심 기능)
   */
  private convertTable(token: TableToken): HWPParagraph {
    // JSON 객체 내부에서 실제 텍스트 값만 추출하는 함수
    const extractTextFromObject = (obj: any): string => {
      if (typeof obj === 'string') return obj;
      if (obj && typeof obj.text === 'string') return obj.text;
      if (obj && typeof obj.tokens && Array.isArray(obj.tokens)) {
        return obj.tokens.map((t: any) => extractTextFromObject(t)).join('');
      }
      if (obj && typeof obj === 'object') {
        return '';
      }
      return String(obj || '');
    };
    
    // 테이블 헤더와 데이터 추출
    const safeHeaders = token.header.map(header => extractTextFromObject(header));
    const safeRows = token.rows.map(row => 
      row.map(cell => extractTextFromObject(cell))
    );
    
    // 셀 너비 계산 (균등 분배)
    const tableWidth = 7200 * 5; // 기본 표 너비 (약 5인치)
    const cellWidth = Math.floor(tableWidth / safeHeaders.length);
    
    // HWP 테이블 제어 객체 생성
    const tableControl: TableControl = {
      type: 'table',
      width: tableWidth,
      height: 0, // 자동 계산
      cellPadding: {
        left: 80,
        right: 80,
        top: 40,
        bottom: 40
      },
      borderFillID: 0, // 기본 테두리/배경 스타일
      rows: []
    };
    
    // 헤더 행 추가
    const headerRow: TableRow = {
      cells: safeHeaders.map(header => ({
        content: header,
        width: cellWidth,
        height: 500, // 헤더 높이
        colSpan: 1,
        rowSpan: 1,
        borderFillID: 1, // 헤더용 배경색 스타일
        align: 'center'
      }))
    };
    tableControl.rows.push(headerRow);
    
    // 데이터 행 추가
    for (const rowData of safeRows) {
      const row: TableRow = {
        cells: rowData.map(cellData => ({
          content: cellData,
          width: cellWidth,
          height: 400, // 일반 셀 높이
          colSpan: 1,
          rowSpan: 1,
          borderFillID: 0, // 기본 테두리/배경 스타일
          align: 'left'
        }))
      };
      tableControl.rows.push(row);
    }
    
    // 테이블 전체 높이 계산
    const headerHeight = 500;
    const rowHeight = 400;
    tableControl.height = headerHeight + (rowHeight * safeRows.length);
    
    // HWP 단락 내 테이블 컨트롤로 반환
    return {
      type: 'paragraph',
      text: '', // 텍스트 없음
      shapeIndex: 0,
      controls: [tableControl],
      shapeBuffer: []
    };
  }
  
  /**
   * 문단 스타일 초기화
   */
  private initParagraphStyles() {
    // 기본 문단 스타일 정보 추가
    this.document.info.paraShapes = [
      // 기본 문단 스타일 (ID: 0)
      {
        align: 'justify',       // 양쪽 정렬
        indent: 0,              // 들여쓰기 없음
        margin: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      // 목록 레벨 1 스타일 (ID: 1)
      {
        align: 'left',          // 왼쪽 정렬
        indent: 20,             // 20pt 들여쓰기
        margin: {
          left: 20,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      // 목록 레벨 2 스타일 (ID: 2)
      {
        align: 'left',
        indent: 40,
        margin: {
          left: 40,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      // 목록 레벨 3 스타일 (ID: 3)
      {
        align: 'left',
        indent: 60,
        margin: {
          left: 60,
          right: 0,
          top: 0,
          bottom: 0
        }
      }
    ];
    
    // 글자 모양 확장 (제목 크기 등)
    this.document.info.charShapes = [
      // 기본 글자 모양 (ID: 0)
      {
        fontId: [0, 0],        // 글꼴 ID (한글, 영문)
        fontBaseSize: 10,      // 글자 크기
        fontRatio: [100, 100], // 장평 (가로, 세로)
        color: [0, 0, 0]       // RGB 색상
      },
      // 제목 1 글자 모양 (ID: 1)
      {
        fontId: [0, 0],
        fontBaseSize: 22,      // 큰 글씨
        fontRatio: [100, 100],
        color: [0, 0, 0]
      },
      // 제목 2 글자 모양 (ID: 2)
      {
        fontId: [0, 0],
        fontBaseSize: 16,      // 중간 글씨
        fontRatio: [100, 100],
        color: [0, 0, 0]
      },
      // 제목 3+ 글자 모양 (ID: 3)
      {
        fontId: [0, 0],
        fontBaseSize: 14,      // 작은 글씨
        fontRatio: [100, 100],
        color: [0, 0, 0]
      }
    ];
  }
  
  /**
   * HWP 바이너리 파일 생성 (실제 바이너리 파일 생성 구현)
   */
  async generateHWPFile(outputPath: string): Promise<string> {
    try {
      // 디버깅을 위해 JSON 구조 저장
      const jsonOutputPath = outputPath.replace(/\.hwp$/, '.json');
      fs.writeFileSync(jsonOutputPath, JSON.stringify(this.document, null, 2), 'utf8');
      console.log(`HWP 변환 중간 데이터가 저장됨: ${jsonOutputPath}`);
      
      // HWP 바이너리 생성
      const hwpBinary = generateHWPBinary(this.document);
      
      // HWP 파일로 저장
      fs.writeFileSync(outputPath, hwpBinary);
      console.log(`HWP 파일이 생성됨: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('HWP 파일 생성 중 오류 발생:', error);
      return Promise.reject(error);
    }
  }
}

// 테스트 함수
export async function testMarkdownToHWP(markdownText: string, outputPath: string): Promise<string> {
  const converter = new MarkdownToHWP();
  converter.parseMarkdown(markdownText);
  return converter.generateHWPFile(outputPath);
} 