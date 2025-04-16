import fs from 'fs-extra';
import path from 'path';
import { DocumentResult } from '../types/index.js';
import * as marked from 'marked';

// hwp.js는 현재 타입 정의가 명확하지 않기 때문에 타입 오류를 피하기 위해 require로 가져옵니다
// 실제 통합 시 hwp.js의 API에 따라 이 부분을 수정하세요
// const hwp = require('hwp.js');

// Marked 라이브러리의 타입 정의 (자체 정의)
interface MarkdownToken {
  type: string;
  [key: string]: any;
}

interface HeadingToken extends MarkdownToken {
  type: 'heading';
  depth: number;
  text: string;
}

interface ParagraphToken extends MarkdownToken {
  type: 'paragraph';
  text: string;
}

interface ListToken extends MarkdownToken {
  type: 'list';
  ordered: boolean;
  items: ListItemToken[];
}

interface ListItemToken extends MarkdownToken {
  type: 'list_item';
  text?: string;
  tokens?: MarkdownToken[];
}

interface BlockquoteToken extends MarkdownToken {
  type: 'blockquote';
  text: string;
}

interface CodeToken extends MarkdownToken {
  type: 'code';
  text: string;
  lang?: string;
}

interface TableToken extends MarkdownToken {
  type: 'table';
  header: string[];
  rows: string[][];
}

interface TextToken extends MarkdownToken {
  type: 'text';
  text: string;
}

interface HWPServiceConfig {
  defaultSaveDir?: string;
}

export class HWPService {
  private config: HWPServiceConfig;

  constructor(config: HWPServiceConfig = {}) {
    this.config = {
      defaultSaveDir: config.defaultSaveDir || process.env.SAVE_DIR || process.cwd()
    };
  }

  /**
   * 새 HWP 문서를 생성합니다
   * @param content 문서에 포함할 텍스트 내용
   * @param options 생성 옵션
   * @returns 저장된 문서 경로가 포함된 결과
   */
  async createDocument(
    content: string,
    options: {
      saveDir?: string;
      fileName?: string;
    } = {}
  ): Promise<DocumentResult> {
    try {
      // 기본 옵션 설정
      const saveDir = options.saveDir || this.config.defaultSaveDir || process.cwd();
      const fileName = options.fileName || `hwp-${Date.now()}`;

      // 저장 디렉토리 확인
      await fs.ensureDir(saveDir);

      // 파일 경로 생성
      let filePath = path.join(saveDir, `${fileName}.hwp`);
      
      // 경로가 절대 경로인지 확인
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(process.cwd(), filePath);
      }

      // HWP 문서 생성 (hwp.js를 사용한 문서 생성 로직)
      // 참고: hwp.js의 현재 버전이 문서 생성을 완전히 지원하지 않을 수 있음
      // 이 경우 구현은 hwp.js의 향후 업데이트에 따라 변경될 수 있음
      // const doc = new hwp.HWPDocument();
      
      // 문서에 내용 추가
      // 실제 구현은 hwp.js API에 따라 달라질 수 있음
      // doc.addContent(content);

      // 문서를 파일로 저장
      // await doc.save(filePath);

      // 임시 구현: 텍스트 파일로 저장 (실제 HWP 생성 대신)
      await fs.writeFile(filePath, content);

      return {
        success: true,
        filePath,
        content
      };
    } catch (error) {
      console.error("HWP 문서 생성 오류:", error);
      
      let errorMessage = '문서 생성 실패';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * HWP 문서를 읽고 파싱합니다
   * @param filePath 읽을 HWP 문서의 경로
   * @returns 파싱된 문서 내용이 포함된 결과
   */
  async readDocument(
    filePath: string
  ): Promise<DocumentResult> {
    try {
      // 경로가 절대 경로인지 확인
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(process.cwd(), filePath);
      }

      // 파일이 존재하는지 확인
      if (!await fs.pathExists(filePath)) {
        return {
          success: false,
          error: `파일을 찾을 수 없음: ${filePath}`
        };
      }

      // HWP 문서 읽기
      // const doc = hwp.HWPDocument.fromBuffer(fileBuffer);
      // const parsedDoc = doc.parse();
      
      // 임시 구현: 텍스트 파일로 읽기 (실제 HWP 파싱 대신)
      const content = await fs.readFile(filePath, 'utf-8');

      return {
        success: true,
        filePath,
        content
      };
    } catch (error) {
      console.error("HWP 문서 읽기 오류:", error);
      
      let errorMessage = '문서 읽기 실패';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * HWP 문서에서 텍스트를 추출합니다
   * @param filePath 텍스트를 추출할 HWP 문서의 경로
   * @returns 추출된 텍스트가 포함된 결과
   */
  async extractText(
    filePath: string
  ): Promise<DocumentResult> {
    try {
      // 경로가 절대 경로인지 확인
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(process.cwd(), filePath);
      }

      // 파일이 존재하는지 확인
      if (!await fs.pathExists(filePath)) {
        return {
          success: false,
          error: `파일을 찾을 수 없음: ${filePath}`
        };
      }

      // HWP 문서 읽기
      // const doc = hwp.HWPDocument.fromBuffer(fileBuffer);
      // const extractedText = doc.getTextContent();
      
      // 임시 구현: 텍스트 파일로 읽기 (실제 HWP 텍스트 추출 대신)
      const extractedText = await fs.readFile(filePath, 'utf-8');

      return {
        success: true,
        filePath,
        content: extractedText
      };
    } catch (error) {
      console.error("HWP 텍스트 추출 오류:", error);
      
      let errorMessage = '텍스트 추출 실패';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * HWP 문서를 편집합니다
   * @param filePath 편집할 HWP 문서의 경로
   * @param edits 적용할 편집 목록
   * @param options 편집 옵션
   * @returns 편집된 문서 경로가 포함된 결과
   */
  async editDocument(
    filePath: string,
    edits: Array<{
      type: string;
      target: string;
      replacement: string;
    }>,
    options: {
      saveDir?: string;
      fileName?: string;
    } = {}
  ): Promise<DocumentResult> {
    try {
      // 경로가 절대 경로인지 확인
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(process.cwd(), filePath);
      }

      // 파일이 존재하는지 확인
      if (!await fs.pathExists(filePath)) {
        return {
          success: false,
          error: `파일을 찾을 수 없음: ${filePath}`
        };
      }

      // 기본 옵션 설정
      const saveDir = options.saveDir || this.config.defaultSaveDir || process.cwd();
      const fileName = options.fileName || `edited-${path.basename(filePath, '.hwp')}-${Date.now()}`;

      // 저장 디렉토리 확인
      await fs.ensureDir(saveDir);

      // 편집된 파일 경로 생성
      let editedFilePath = path.join(saveDir, `${fileName}.hwp`);
      
      // 경로가 절대 경로인지 확인
      if (!path.isAbsolute(editedFilePath)) {
        editedFilePath = path.resolve(process.cwd(), editedFilePath);
      }

      // HWP 문서 읽기
      // const fileBuffer = await fs.readFile(filePath);
      // const doc = hwp.HWPDocument.fromBuffer(fileBuffer);
      
      // 편집 적용
      // for (const edit of edits) {
      //   if (edit.type === 'replace') {
      //     doc.replace(edit.target, edit.replacement);
      //   }
      // }
      
      // 편집된 문서 저장
      // await doc.save(editedFilePath);

      // 임시 구현: 텍스트 파일 편집 (실제 HWP 편집 대신)
      let content = await fs.readFile(filePath, 'utf-8');
      
      // 편집 적용
      for (const edit of edits) {
        if (edit.type === 'replace') {
          content = content.replace(new RegExp(edit.target, 'g'), edit.replacement);
        }
      }
      
      // 편집된 파일 저장
      await fs.writeFile(editedFilePath, content);

      return {
        success: true,
        filePath: editedFilePath,
        content
      };
    } catch (error) {
      console.error("HWP 문서 편집 오류:", error);
      
      let errorMessage = '문서 편집 실패';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 마크다운을 HWP 문서로 변환합니다
   * @param markdown 변환할 마크다운 텍스트
   * @param options 변환 옵션
   * @returns 저장된 문서 경로가 포함된 결과
   */
  async convertMarkdownToHWP(
    markdown: string,
    options: {
      saveDir?: string;
      fileName?: string;
    } = {}
  ): Promise<DocumentResult> {
    try {
      // 기본 옵션 설정
      const saveDir = options.saveDir || this.config.defaultSaveDir || process.cwd();
      const fileName = options.fileName || `hwp-markdown-${Date.now()}`;

      // 저장 디렉토리 확인
      await fs.ensureDir(saveDir);

      // 파일 경로 생성
      let filePath = path.join(saveDir, `${fileName}.hwp`);
      
      // 경로가 절대 경로인지 확인
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(process.cwd(), filePath);
      }

      // 마크다운 토큰으로 파싱
      const tokens = marked.lexer(markdown) as MarkdownToken[];
      
      try {
        // hwp.js 라이브러리를 사용하여 HWP 문서 생성 시도
        const hwp = require('hwp.js');
        const doc = new hwp.HWPDocument();
        
        // 마크다운 구조를 HWP 문서에 적용
        this.applyMarkdownStructure(doc, markdown);
        
        // 문서 저장
        await doc.save(filePath);
        
        return {
          success: true,
          filePath,
          content: markdown // 원본 마크다운 내용 반환
        };
      } catch (hwpError) {
        console.warn("hwp.js 라이브러리 사용 오류, 대체 방법으로 텍스트 변환:", hwpError);
        
        // 임시 코드: 토큰 기반 텍스트 변환 로직 (hwp.js 사용 실패 시 폴백)
        let outputContent = await this.generateFormattedText(tokens);
        
        // 임시 구현: 포맷된 텍스트 저장
        await fs.writeFile(filePath, outputContent);

        return {
          success: true,
          filePath,
          content: outputContent
        };
      }
    } catch (error) {
      console.error("마크다운 변환 오류:", error);
      
      let errorMessage = '마크다운 변환 실패';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 마크다운 토큰에서 서식화된 텍스트를 생성합니다.
   * 이것은 임시 구현으로, 실제로는 HWP 문서 객체 모델을 생성해야 합니다.
   */
  private async generateFormattedText(tokens: MarkdownToken[]): Promise<string> {
    let output = '';
    
    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          // 제목 서식 적용 - '#' 기호 없이 텍스트만 추가
          output += this.formatHeading((token as HeadingToken).text, (token as HeadingToken).depth);
          break;
          
        case 'paragraph':
          // 문단 서식 적용
          output += this.formatParagraph((token as ParagraphToken).text);
          break;
          
        case 'list':
          // 목록 서식 적용
          output += this.formatList(token as ListToken);
          break;
          
        case 'blockquote':
          // 인용구 서식 적용
          output += this.formatBlockquote((token as BlockquoteToken).text);
          break;
          
        case 'code':
          // 코드 블록 서식 적용
          output += this.formatCodeBlock((token as CodeToken).text, (token as CodeToken).lang);
          break;
          
        case 'table':
          // 표 서식 적용
          output += this.formatTable(token as TableToken);
          break;
          
        case 'hr':
          // 수평선 서식 적용
          output += this.formatHorizontalRule();
          break;
          
        case 'space':
          output += '\n\n';
          break;
          
        default:
          if (token.type === 'text') {
            output += (token as TextToken).text + '\n';
          } else {
            console.warn(`처리되지 않은 토큰 유형: ${token.type}`);
          }
      }
    }
    
    return output;
  }

  /**
   * 제목 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_STYLE을 사용하여 제목 스타일을 적용해야 합니다.
   */
  private formatHeading(text: string, level: number): string {
    // 제목 레벨에 따라 다른 텍스트 표현이지만 '#' 기호는 표시하지 않음
    return `\n${text}\n\n`;
  }

  /**
   * 문단 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_PARA_HEADER와 HWPTAG_PARA_TEXT를 사용해야 합니다.
   */
  private formatParagraph(text: string): string {
    // 임시 구현: 문단 텍스트에 줄바꿈 추가
    return `${text}\n\n`;
  }

  /**
   * 목록 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_BULLET 또는 HWPTAG_NUMBERING을 사용해야 합니다.
   */
  private formatList(list: ListToken): string {
    let output = '\n';
    
    for (let i = 0; i < list.items.length; i++) {
      const item = list.items[i];
      const bullet = list.ordered ? `${i + 1}. ` : '• ';
      const text = this.getListItemText(item);
      output += `${bullet}${text}\n`;
    }
    
    return output + '\n';
  }

  /**
   * 목록 항목의 텍스트를 추출합니다.
   */
  private getListItemText(item: ListItemToken): string {
    let text = '';
    
    if (item.tokens) {
      for (const token of item.tokens) {
        if (token.type === 'text') {
          text += (token as TextToken).text;
        } else if (token.type === 'paragraph') {
          text += (token as ParagraphToken).text;
        }
      }
    }
    
    return text;
  }

  /**
   * 인용구 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_PARA_SHAPE와 HWPTAG_BORDER_FILL을 사용해야 합니다.
   */
  private formatBlockquote(text: string): string {
    // 임시 구현: 인용구 텍스트에 '>' 접두사 추가
    const lines = text.split('\n');
    const quotedLines = lines.map(line => `> ${line}`);
    return `\n${quotedLines.join('\n')}\n\n`;
  }

  /**
   * 코드 블록 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_PARA_SHAPE와 고정폭 글꼴을 사용해야 합니다.
   */
  private formatCodeBlock(code: string, language: string | undefined): string {
    // 임시 구현: 코드 블록을 백틱으로 감싸고 언어 정보 추가
    return `\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\n`;
  }

  /**
   * 표 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_TABLE을 사용해야 합니다.
   */
  private formatTable(table: TableToken): string {
    let output = '\n';
    
    // JSON 객체 내부에서 실제 텍스트 값만 추출하는 함수
    const extractTextFromObject = (obj: any): string => {
      if (typeof obj === 'string') return obj;
      if (obj && typeof obj.text === 'string') return obj.text;
      if (obj && typeof obj.tokens && Array.isArray(obj.tokens)) {
        return obj.tokens.map((token: any) => extractTextFromObject(token)).join('');
      }
      if (obj && typeof obj === 'object') {
        return '';
      }
      return String(obj || '');
    };
    
    // 테이블 헤더와 데이터가 실제 문자열인지 확인하고 변환
    const safeHeaders = table.header.map(header => extractTextFromObject(header));
    
    const safeRows = table.rows.map(row => 
      row.map(cell => extractTextFromObject(cell))
    );
    
    // 헤더 행 추가
    output += '| ';
    for (const cell of safeHeaders) {
      output += `${cell} | `;
    }
    output += '\n';
    
    // 구분선 추가
    output += '| ';
    for (let i = 0; i < safeHeaders.length; i++) {
      output += '------ | ';
    }
    output += '\n';
    
    // 데이터 행 추가
    for (const row of safeRows) {
      output += '| ';
      for (const cell of row) {
        output += `${cell} | `;
      }
      output += '\n';
    }
    
    return output + '\n';
  }

  /**
   * 수평선 서식을 적용합니다.
   * 실제 구현에서는 HWPTAG_BORDER_FILL을 사용해야 합니다.
   */
  private formatHorizontalRule(): string {
    // 임시 구현: 대시로 수평선 표현
    return '\n----------------------------\n\n';
  }

  /**
   * 마크다운 구조를 HWP 문서에 적용합니다 (향후 구현)
   * 이 메서드는 진정한 HWP 포맷 변환을 위한 템플릿입니다.
   * hwp.js API를 활용하여 실제 구현해야 합니다.
   */
  private applyMarkdownStructure(doc: any, markdown: string): void {
    // 마크다운 파싱
    const tokens = marked.lexer(markdown) as MarkdownToken[];
    
    try {
      // HWP 문서 스타일 설정
      this.setupHWPDocumentStyles(doc);
      
      // 각 요소를 HWP 구조로 변환
      for (const token of tokens) {
        switch (token.type) {
          case 'heading':
            // 제목 추가 (크기, 정렬 등 설정)
            this.createHeadingInDocument(doc, (token as HeadingToken).text, (token as HeadingToken).depth);
            break;
            
          case 'paragraph':
            // 문단 추가
            this.createParagraphInDocument(doc, (token as ParagraphToken).text);
            break;
            
          case 'list':
            // 목록 추가 (글머리 기호 등)
            this.createListInDocument(doc, token as ListToken);
            break;
            
          case 'blockquote':
            // 인용구 추가
            this.createBlockquoteInDocument(doc, (token as BlockquoteToken).text);
            break;
            
          case 'code':
            // 코드 블록 추가 (특수 서식)
            this.createCodeBlockInDocument(doc, (token as CodeToken).text, (token as CodeToken).lang);
            break;
            
          case 'table':
            // 표 추가
            this.createTableInDocument(doc, token as TableToken);
            break;
            
          case 'hr':
            // 수평선 추가
            this.createHorizontalRuleInDocument(doc);
            break;
            
          default:
            if (token.type === 'text') {
              // 일반 텍스트 추가
              this.createParagraphInDocument(doc, (token as TextToken).text);
            } else {
              console.warn(`처리되지 않은 토큰 유형: ${token.type}`);
            }
        }
      }
    } catch (error) {
      console.error("마크다운 구조 적용 오류:", error);
      throw error;
    }
  }

  /**
   * HWP 문서에 스타일을 설정합니다.
   * hwp.js API를 활용하여 구현해야 합니다.
   */
  private setupHWPDocumentStyles(doc: any): void {
    try {
      // hwp.js API를 사용하여 스타일 설정
      // 기본 스타일 설정
      const defaultStyle = doc.createStyle('기본');
      defaultStyle.charShape.fontName = '맑은 고딕';
      defaultStyle.charShape.size = 10 * 100; // 10pt
      
      // 테두리/배경 정의 (HWPTAG_BORDER_FILL)
      const defaultBorderFill = doc.createBorderFill(1); // ID 1 할당
      defaultBorderFill.borderType = 'none';
      defaultBorderFill.backgroundColor = '#FFFFFF';
      
      // 표 테두리/배경 정의
      const tableBorderFill = doc.createBorderFill(2); // ID 2 할당
      tableBorderFill.borderType = 'all';
      tableBorderFill.borderWidth = 1;
      tableBorderFill.borderColor = '#000000';
      tableBorderFill.backgroundColor = '#FFFFFF';
      
      // 헤더 셀 테두리/배경 정의
      const headerBorderFill = doc.createBorderFill(3); // ID 3 할당
      headerBorderFill.borderType = 'all';
      headerBorderFill.borderWidth = 1;
      headerBorderFill.borderColor = '#000000';
      headerBorderFill.backgroundColor = '#EEEEEE';
      
      // 인용구 테두리/배경 정의
      const quoteBorderFill = doc.createBorderFill(4); // ID 4 할당
      quoteBorderFill.borderType = 'left';
      quoteBorderFill.borderWidth = 3;
      quoteBorderFill.borderColor = '#AAAAAA';
      quoteBorderFill.backgroundColor = '#F8F8F8';
      
      // 제목 스타일들 설정 (HWPTAG_STYLE)
      for (let i = 1; i <= 6; i++) {
        const headingStyle = doc.createStyle(`제목 ${i}`);
        headingStyle.charShape.fontName = '맑은 고딕';
        headingStyle.charShape.size = (16 - i) * 100; // 제목 레벨에 따라 크기 조절
        headingStyle.charShape.bold = true;
        
        // 문단 모양 설정 (HWPTAG_PARA_SHAPE)
        headingStyle.paraShape = {
          align: i <= 2 ? 'center' : 'left', // 제목 1, 2는 가운데 정렬
          margin: {
            top: 300, // 상단 여백
            bottom: 200, // 하단 여백
            left: 0,
            right: 0
          },
          lineSpacing: 150, // 줄 간격 150%
        };
        
        // 제목 1, 2는 가운데 정렬
        if (i <= 2) {
          headingStyle.paraShape.alignment = 'center';
        }
      }
      
      // 인용구 스타일 설정 (HWPTAG_STYLE)
      const quoteStyle = doc.createStyle('인용구');
      quoteStyle.charShape.fontName = '맑은 고딕';
      quoteStyle.charShape.size = 10 * 100;
      quoteStyle.charShape.italic = true;
      
      // 인용구 문단 모양 (HWPTAG_PARA_SHAPE)
      quoteStyle.paraShape = {
        indent: 200, // 들여쓰기
        margin: {
          left: 200,
          right: 0,
          top: 100,
          bottom: 100
        }
      };
      
      // 인용구에 테두리 적용 (HWPTAG_BORDER_FILL 참조)
      quoteStyle.borderFillId = 4; // 위에서 만든 인용구 테두리/배경 ID
      
      // 코드 블록 스타일 설정 (HWPTAG_STYLE)
      const codeStyle = doc.createStyle('코드');
      codeStyle.charShape.fontName = 'Consolas';
      codeStyle.charShape.size = 9 * 100; // 9pt
      
      // 코드 블록 문단 모양 (HWPTAG_PARA_SHAPE)
      codeStyle.paraShape = {
        indent: 200,
        margin: {
          left: 200,
          right: 200,
          top: 100,
          bottom: 100
        },
        lineSpacing: 120 // 줄 간격 120%
      };
      
      // 코드 블록에 배경색 적용 (HWPTAG_BORDER_FILL 생성)
      const codeBorderFill = doc.createBorderFill(5); // ID 5 할당
      codeBorderFill.borderType = 'all';
      codeBorderFill.borderWidth = 1;
      codeBorderFill.borderColor = '#CCCCCC';
      codeBorderFill.backgroundColor = '#F5F5F5';
      
      codeStyle.borderFillId = 5; // 코드 블록용 테두리/배경 ID 참조
      
      // 목록 스타일 설정 (글머리 기호용)
      const bulletListStyle = doc.createStyle('글머리기호목록');
      bulletListStyle.charShape.fontName = '맑은 고딕';
      bulletListStyle.charShape.size = 10 * 100;
      
      // 글머리 기호 속성 (HWPTAG_BULLET)
      bulletListStyle.paraShape = {
        indent: 200,
        margin: {
          left: 200,
          right: 0,
          top: 50,
          bottom: 50
        }
      };
      
      // 번호 매기기 목록 스타일 (HWPTAG_NUMBERING)
      const numberListStyle = doc.createStyle('번호매기기목록');
      numberListStyle.charShape.fontName = '맑은 고딕';
      numberListStyle.charShape.size = 10 * 100;
      
      numberListStyle.paraShape = {
        indent: 200,
        margin: {
          left: 200,
          right: 0,
          top: 50,
          bottom: 50
        }
      };
      
    } catch (error) {
      console.warn("스타일 설정 오류:", error);
      // 오류 발생 시 기본 스타일만 설정하려고 시도
      try {
        const defaultStyle = doc.createStyle('기본');
        defaultStyle.charShape.fontName = '맑은 고딕';
      } catch (e) {
        console.error("기본 스타일 설정 실패:", e);
      }
    }
  }

  /**
   * HWP 문서에 제목을 생성합니다.
   */
  private createHeadingInDocument(doc: any, text: string, level: number): void {
    try {
      const paragraph = doc.addParagraph(text);
      paragraph.applyStyle(`제목 ${level}`);
    } catch (error) {
      console.warn(`제목 스타일 적용 오류(레벨: ${level}):`, error);
      // 오류 발생 시 일반 텍스트로 추가하고 크기만 조절
      try {
        const paragraph = doc.addParagraph(text);
        paragraph.charShape.bold = true;
        paragraph.charShape.size = (16 - level) * 100; // 크기만 조절
      } catch (e) {
        console.error("제목 기본 추가 실패:", e);
        doc.addParagraph(`# ${text}`);
      }
    }
  }

  /**
   * HWP 문서에 문단을 생성합니다.
   */
  private createParagraphInDocument(doc: any, text: string): void {
    try {
      const paragraph = doc.addParagraph(text);
      paragraph.applyStyle('기본');
    } catch (error) {
      console.warn("문단 추가 오류:", error);
      try {
        // 오류 발생 시 기본 메소드로 추가
        doc.addParagraph(text);
      } catch (e) {
        console.error("기본 문단 추가 실패:", e);
      }
    }
  }

  /**
   * HWP 문서에 목록을 생성합니다.
   */
  private createListInDocument(doc: any, list: ListToken): void {
    try {
      for (const item of list.items) {
        const text = this.getListItemText(item);
        const paragraph = doc.addParagraph(text);
        
        if (list.ordered) {
          // 번호 목록
          paragraph.setNumbering(1);
        } else {
          // 글머리 기호 목록
          paragraph.setBullet();
        }
      }
    } catch (error) {
      console.warn("목록 추가 오류:", error);
      try {
        // 오류 발생 시 일반 텍스트로 추가
        for (const item of list.items) {
          const text = this.getListItemText(item);
          const prefix = list.ordered ? '1. ' : '• ';
          doc.addParagraph(`${prefix}${text}`);
        }
      } catch (e) {
        console.error("기본 목록 추가 실패:", e);
      }
    }
  }

  /**
   * HWP 문서에 인용구를 생성합니다.
   */
  private createBlockquoteInDocument(doc: any, text: string): void {
    try {
      const paragraph = doc.addParagraph(text);
      paragraph.applyStyle('인용구');
    } catch (error) {
      console.warn("인용구 추가 오류:", error);
      try {
        // 오류 발생 시 들여쓰기만 적용
        const paragraph = doc.addParagraph(text);
        paragraph.paraShape.indent = 10 * 100; // 들여쓰기
      } catch (e) {
        console.error("기본 인용구 추가 실패:", e);
        doc.addParagraph(`> ${text}`);
      }
    }
  }

  /**
   * HWP 문서에 코드 블록을 생성합니다.
   */
  private createCodeBlockInDocument(doc: any, code: string, language: string | undefined): void {
    try {
      const paragraph = doc.addParagraph(code);
      paragraph.applyStyle('코드');
      
      // 언어 정보가 있으면 주석으로 추가
      if (language) {
        const langComment = doc.addParagraph(`// 언어: ${language}`);
        langComment.applyStyle('코드');
      }
    } catch (error) {
      console.warn("코드 블록 추가 오류:", error);
      try {
        // 오류 발생 시 고정폭 글꼴만 적용
        const paragraph = doc.addParagraph(code);
        paragraph.charShape.fontName = 'Consolas';
        
        if (language) {
          doc.addParagraph(`// 언어: ${language}`);
        }
      } catch (e) {
        console.error("기본 코드 블록 추가 실패:", e);
        doc.addParagraph("```\n" + code + "\n```");
      }
    }
  }

  /**
   * HWP 문서에 표를 생성합니다.
   */
  private createTableInDocument(doc: any, table: TableToken): void {
    try {
      // JSON 객체 내부에서 실제 텍스트 값만 추출하는 함수
      const extractTextFromObject = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (obj && typeof obj.text === 'string') return obj.text;
        if (obj && typeof obj.tokens && Array.isArray(obj.tokens)) {
          return obj.tokens.map((token: any) => extractTextFromObject(token)).join('');
        }
        if (obj && typeof obj === 'object') {
          return '';
        }
        return String(obj || '');
      };
      
      // 테이블 헤더와 데이터가 실제 문자열인지 확인하고 변환
      const safeHeaders = table.header.map(header => extractTextFromObject(header));
      const safeRows = table.rows.map(row => 
        row.map(cell => extractTextFromObject(cell))
      );
      
      // 테이블 행과 열 수 계산
      const rowCount = table.rows.length + 1; // 헤더 행 포함
      const columnCount = table.header.length;
      
      try {
        // 실제 HWP 테이블 생성 시도
        if (typeof doc.createTable === 'function') {
          // 실제 HWP 테이블 생성
          const hwpTable = doc.createTable(rowCount, columnCount);
          
          // 테이블 속성 설정
          if (typeof hwpTable.setTableProperties === 'function') {
            hwpTable.setTableProperties({
              borderFillId: 1, // 테두리/배경 참조 ID
              cellSpacing: 0, // 셀 간격 없음
              rowSize: 1000, // 기본 행 높이 (HWPUNIT)
              padding: { left: 80, right: 80, top: 40, bottom: 40 } // 셀 내부 여백
            });
          }
          
          // 테이블 테두리 설정
          if (typeof hwpTable.setBorder === 'function') {
            hwpTable.setBorder({
              type: 'all', // 모든 셀 테두리
              width: 1, // 테두리 두께
              color: '#000000' // 검은색 테두리
            });
          }
          
          // 헤더 행 설정
          for (let col = 0; col < columnCount; col++) {
            const cell = hwpTable.getCell(0, col);
            if (cell) {
              if (typeof cell.setText === 'function') {
                cell.setText(safeHeaders[col]);
              }
              if (typeof cell.setCharShape === 'function') {
                cell.setCharShape({
                  bold: true, // 굵게
                  fontName: '맑은 고딕',
                  fontSize: 10 // 글자 크기
                });
              }
              if (typeof cell.setBackground === 'function') {
                cell.setBackground('#EEEEEE'); // 헤더 배경색
              }
              if (typeof cell.setAlignment === 'function') {
                cell.setAlignment('center'); // 가운데 정렬
              }
            }
          }
          
          // 데이터 행 설정
          for (let row = 0; row < table.rows.length; row++) {
            for (let col = 0; col < columnCount && col < table.rows[row].length; col++) {
              const cell = hwpTable.getCell(row + 1, col);
              if (cell) {
                if (typeof cell.setText === 'function') {
                  cell.setText(safeRows[row][col]);
                }
                if (typeof cell.setCharShape === 'function') {
                  cell.setCharShape({
                    fontName: '맑은 고딕',
                    fontSize: 10 // 글자 크기
                  });
                }
              }
            }
          }
          
          // 테이블을 문서에 추가
          if (typeof doc.addTable === 'function') {
            doc.addTable(hwpTable);
            console.log("테이블이 성공적으로 추가되었습니다.");
            return; // 성공적으로 테이블 추가 완료
          } else {
            throw new Error("addTable 메서드가 정의되지 않았습니다.");
          }
        } else {
          throw new Error("createTable 메서드가 정의되지 않았습니다.");
        }
      } catch (tableError) {
        console.warn("HWP 테이블 생성 오류, 대체 방법 사용:", tableError);
        throw tableError; // 상위 catch 블록으로 전달하여 텍스트 형식 대체
      }
    } catch (error) {
      console.warn("표 추가 오류:", error);
      throw error; // 상위 호출자에게 오류 전달
    }
  }

  /**
   * HWP 문서에 수평선을 생성합니다.
   */
  private createHorizontalRuleInDocument(doc: any): void {
    try {
      const line = doc.addShape('line');
      line.width = '100%';
      line.height = '1pt';
    } catch (error) {
      console.warn("수평선 추가 오류:", error);
      try {
        // 오류 발생 시 텍스트로 수평선 표현
        doc.addParagraph("----------");
      } catch (e) {
        console.error("기본 수평선 추가 실패:", e);
      }
    }
  }

  /**
   * HTML을 일반 텍스트로 변환합니다 (임시 구현)
   */
  private convertHtmlToPlainText(html: string): string {
    // HTML 태그 제거
    let text = html.replace(/<[^>]*>/g, '');
    
    // 특수 HTML 엔티티 변환
    text = text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&nbsp;/g, ' ');
    
    // 여러 줄바꿈을 하나로 정리
    text = text.replace(/\n\s*\n/g, '\n\n');
    
    return text;
  }
} 