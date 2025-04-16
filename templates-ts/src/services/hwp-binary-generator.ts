/**
 * HWP 바이너리 파일 생성 모듈
 * HWP 문서 구조를 실제 바이너리 파일로 변환
 */

import * as fs from 'fs';
import { Buffer } from 'buffer';
import * as cfb from 'cfb';

// HWP 상수 정의
const HWP_SIGNATURE = 'HWP Document File';
const HWP_VERSION = [5, 0, 0, 0]; // [major, minor, build, revision]

// cfb 라이브러리 직접 require (CommonJS 방식으로 불러옴)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CFB = require('cfb');

// 레코드 태그 ID 정의
const HWPTAG = {
  DOCUMENT_PROPERTIES: 0x010,
  ID_MAPPINGS: 0x011,
  BIN_DATA: 0x015,
  FACE_NAME: 0x017,
  BORDER_FILL: 0x01B,
  CHAR_SHAPE: 0x01C,
  TAB_DEF: 0x01D,
  NUMBERING: 0x01E,
  BULLET: 0x01F,
  PARA_SHAPE: 0x020,
  STYLE: 0x021,
  PARA_HEADER: 0x420,
  PARA_TEXT: 0x421,
  PARA_CHAR_SHAPE: 0x422,
  PARA_LINE_SEG: 0x423,
  CTRL_HEADER: 0x425,
  TABLE: 0x430,
  LIST_HEADER: 0x431,
  PAGE_DEF: 0x434,
  CELL_HIDE: 0x435,
  CELL_LIST_HEADER: 0x438,
  SHAPE_COMPONENT: 0x441,
  TABLE_CELL: 0x446,
  SHAPE_COMPONENT_PARAGRAPH: 0x450
};

// 제어 문자 코드
const CONTROL_CHAR = {
  SECTION_COLUMN_DEF: 0x9,
  FIELD_START: 0x10,
  FIELD_END: 0x11,
  TABLE_CONTROL: 0xE,
  TBLPARA: 0xB9,
  CHAR_ATTR: 0x26,
  LINE_ATTR: 0x27,
  SEC_DEF: 0x8,
  OBJ: 0x9,
  EQUATION: 0xC
};

/**
 * 바이너리 데이터 작성 클래스
 */
export class BinaryWriter {
  private buffer: Buffer;
  private position: number;
  
  constructor(initialSize = 1024) {
    this.buffer = Buffer.alloc(initialSize);
    this.position = 0;
  }
  
  /**
   * 현재 버퍼 내용 가져오기
   */
  getBuffer(): Buffer {
    return this.buffer.slice(0, this.position);
  }
  
  /**
   * 버퍼 크기 확장
   */
  private ensureCapacity(bytesNeeded: number): void {
    if (this.position + bytesNeeded > this.buffer.length) {
      const newBuffer = Buffer.alloc(Math.max(this.buffer.length * 2, this.position + bytesNeeded));
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
  }
  
  /**
   * 1바이트 쓰기
   */
  writeUInt8(value: number): void {
    this.ensureCapacity(1);
    this.buffer.writeUInt8(value, this.position);
    this.position += 1;
  }
  
  /**
   * 2바이트 쓰기
   */
  writeUInt16(value: number): void {
    this.ensureCapacity(2);
    this.buffer.writeUInt16LE(value, this.position);
    this.position += 2;
  }
  
  /**
   * 4바이트 쓰기
   */
  writeUInt32(value: number): void {
    this.ensureCapacity(4);
    this.buffer.writeUInt32LE(value, this.position);
    this.position += 4;
  }
  
  /**
   * 문자열 쓰기 (UTF-16LE)
   */
  writeString(text: string): void {
    const strBuffer = Buffer.from(text, 'utf16le');
    this.ensureCapacity(strBuffer.length);
    strBuffer.copy(this.buffer, this.position);
    this.position += strBuffer.length;
  }
  
  /**
   * 문자열 쓰기 (길이 포함, UTF-16LE)
   */
  writeStringWithLength(text: string): void {
    const strBuffer = Buffer.from(text, 'utf16le');
    this.ensureCapacity(4 + strBuffer.length);
    this.writeUInt32(strBuffer.length / 2); // 문자 개수 (UTF-16은 2바이트 문자)
    strBuffer.copy(this.buffer, this.position);
    this.position += strBuffer.length;
  }
  
  /**
   * 바이트 배열 쓰기
   */
  writeBytes(bytes: Buffer): void {
    this.ensureCapacity(bytes.length);
    bytes.copy(this.buffer, this.position);
    this.position += bytes.length;
  }
  
  /**
   * 레코드 헤더 쓰기
   */
  writeRecordHeader(tagID: number, size: number, isCompressed: boolean = false): void {
    this.ensureCapacity(4);
    // 태그 ID (2바이트)
    this.writeUInt16(tagID);
    // 레코드 크기 (4바이트)
    const sizeWithFlags = size & 0x00FFFFFF;
    // 압축 플래그 설정
    const flagByte = isCompressed ? 0x01 : 0x00;
    // 크기와 플래그 결합
    this.writeUInt8(sizeWithFlags & 0xFF);
    this.writeUInt8(((sizeWithFlags >> 8) & 0xFF) | (flagByte << 5));
    this.writeUInt8((sizeWithFlags >> 16) & 0xFF);
  }
}

/**
 * HWP 바이너리 파일 생성기
 */
export class HWPBinaryGenerator {
  /**
   * FileHeader 스트림 생성
   */
  createFileHeader(): Buffer {
    const writer = new BinaryWriter();
    // 시그니처
    writer.writeString(HWP_SIGNATURE);
    // 버전
    writer.writeUInt32(
      (HWP_VERSION[0] << 24) |
      (HWP_VERSION[1] << 16) |
      (HWP_VERSION[2] << 8) |
      HWP_VERSION[3]
    );
    // 문서 속성 (0: 압축 안 함, 암호화 안 함, 디지털 서명 안 함)
    writer.writeUInt32(0);
    // 문서 임시 저장 여부
    writer.writeUInt32(0);
    // 예약 영역 (256 - 위에서 사용한 바이트 수)
    const reserved = Buffer.alloc(256 - 4 - 4 - 4 - HWP_SIGNATURE.length);
    writer.writeBytes(reserved);
    
    return writer.getBuffer();
  }
  
  /**
   * DocInfo 스트림 생성
   */
  createDocInfo(info: any): Buffer {
    const writer = new BinaryWriter();
    
    // 문서 속성
    const docPropsSize = 22; // 문서 속성 레코드 크기
    writer.writeRecordHeader(HWPTAG.DOCUMENT_PROPERTIES, docPropsSize);
    writer.writeUInt16(0); // 구역 개수
    writer.writeUInt16(0); // 페이지 시작 번호
    writer.writeUInt16(0); // 각주 시작 번호
    writer.writeUInt16(0); // 미주 시작 번호
    writer.writeUInt16(0); // 그림 시작 번호
    writer.writeUInt16(0); // 표 시작 번호
    writer.writeUInt16(0); // 수식 시작 번호
    writer.writeUInt8(0);  // 문단 번호 종류
    writer.writeUInt8(0);  // 표 번호 종류
    writer.writeUInt16(0); // 문서 양식의 종류
    writer.writeUInt32(0); // 탭 설정 기준 단위
    writer.writeUInt32(0); // 언어 코드
    
    // 글꼴 정보
    if (info.fontFaces && info.fontFaces.length > 0) {
      for (const font of info.fontFaces) {
        this.writeFontFace(writer, font);
      }
    }
    
    // 테두리/배경 정보
    if (info.borderFills && info.borderFills.length > 0) {
      for (const borderFill of info.borderFills) {
        this.writeBorderFill(writer, borderFill);
      }
    }
    
    // 글자 모양 정보
    if (info.charShapes && info.charShapes.length > 0) {
      for (const charShape of info.charShapes) {
        this.writeCharShape(writer, charShape);
      }
    }
    
    return writer.getBuffer();
  }
  
  /**
   * 글꼴 정보 쓰기
   */
  private writeFontFace(writer: BinaryWriter, fontFace: any): void {
    const nameLength = Buffer.from(fontFace.name, 'utf16le').length;
    const recordSize = 4 + nameLength + 10;
    
    writer.writeRecordHeader(HWPTAG.FACE_NAME, recordSize);
    writer.writeUInt16(0); // 속성 (0: 트루타입)
    writer.writeUInt16(0); // 언어 코드
    writer.writeStringWithLength(fontFace.name); // 글꼴 이름
    writer.writeUInt8(1); // 대체 글꼴 유형 (1: 없음)
    writer.writeUInt8(0); // 기본 글꼴 (0: 없음)
    writer.writeUInt8(0); // 글꼴 계열 (0: 병행)
    writer.writeUInt8(0); // 기본 글꼴 크기
  }
  
  /**
   * 테두리/배경 정보 쓰기
   */
  private writeBorderFill(writer: BinaryWriter, borderFill: any): void {
    const recordSize = 14 + (4 * 8); // 기본 속성 + 4개 테두리 속성
    
    writer.writeRecordHeader(HWPTAG.BORDER_FILL, recordSize);
    writer.writeUInt16(0); // 속성
    
    // 4개 테두리 속성
    for (const side of ['left', 'right', 'top', 'bottom']) {
      const border = borderFill.style[side];
      writer.writeUInt8(border.type);  // 테두리 선 종류
      writer.writeUInt8(border.width); // 테두리 선 두께
      writer.writeUInt8(border.color[0]); // R
      writer.writeUInt8(border.color[1]); // G
      writer.writeUInt8(border.color[2]); // B
      writer.writeUInt8(0); // 예약
    }
    
    // 배경색
    writer.writeUInt8(borderFill.backgroundColor[0]); // R
    writer.writeUInt8(borderFill.backgroundColor[1]); // G
    writer.writeUInt8(borderFill.backgroundColor[2]); // B
    writer.writeUInt8(0); // 예약
    
    // 채우기 정보 없음 (간소화)
    writer.writeUInt16(0); // 채우기 유형 (0: 없음)
    writer.writeUInt16(0); // 추가 채우기 정보
  }
  
  /**
   * 글자 모양 정보 쓰기
   */
  private writeCharShape(writer: BinaryWriter, charShape: any): void {
    const recordSize = 60;
    
    writer.writeRecordHeader(HWPTAG.CHAR_SHAPE, recordSize);
    
    // 글꼴 ID (한글, 영문, 한자, 일어, 기타, 기호, 사용자)
    writer.writeUInt16(charShape.fontId[0] || 0);
    writer.writeUInt16(charShape.fontId[1] || 0);
    writer.writeUInt16(0); // 한자
    writer.writeUInt16(0); // 일어
    writer.writeUInt16(0); // 기타
    writer.writeUInt16(0); // 기호
    writer.writeUInt16(0); // 사용자
    
    // 글자 크기 (한글, 영문, 한자, 일어, 기타, 기호, 사용자)
    const size = charShape.fontBaseSize || 10;
    for (let i = 0; i < 7; i++) {
      writer.writeUInt16(size);
    }
    
    // 글자 속성 (굵게(1), 이탤릭(2), 밑줄(4), 취소선(8), 음각(16), 양각(32), 그림자(64) 등)
    writer.writeUInt32(0); // 기본 속성 없음
    
    // 글자색
    writer.writeUInt8(charShape.color[0] || 0); // R
    writer.writeUInt8(charShape.color[1] || 0); // G
    writer.writeUInt8(charShape.color[2] || 0); // B
    writer.writeUInt8(0); // 예약
    
    // 밑줄색, 음영색, 그림자색 (모두 검정으로 설정)
    for (let i = 0; i < 3; i++) {
      writer.writeUInt8(0); // R
      writer.writeUInt8(0); // G
      writer.writeUInt8(0); // B
      writer.writeUInt8(0); // 예약
    }
    
    // 글자 간격, 장평, 위치
    writer.writeUInt8(0); // 글자 간격
    writer.writeUInt8(100); // 장평 (100%)
    writer.writeUInt8(0); // 위치 (0: 기준선)
    writer.writeUInt8(0); // 예약
  }
  
  /**
   * BodyText 스트림 생성
   */
  createBodyText(sections: any[]): Buffer[] {
    // 각 섹션별로 별도의 스트림 생성
    return sections.map((section, index) => {
      return this.createSectionStream(section, index);
    });
  }
  
  /**
   * 섹션 스트림 생성
   */
  private createSectionStream(section: any, sectionIndex: number): Buffer {
    const writer = new BinaryWriter();
    
    // 섹션 정의 레코드
    const sectionDefSize = 30;
    writer.writeRecordHeader(HWPTAG.PAGE_DEF, sectionDefSize);
    
    // 용지 크기 및 여백
    writer.writeUInt32(section.width || 59528); // A4 너비 (in HWPUNIT)
    writer.writeUInt32(section.height || 84189); // A4 높이 (in HWPUNIT)
    writer.writeUInt32(section.paddingLeft || 5670); // 왼쪽 여백
    writer.writeUInt32(section.paddingRight || 5670); // 오른쪽 여백
    writer.writeUInt32(section.paddingTop || 4252); // 위쪽 여백
    writer.writeUInt32(section.paddingBottom || 4252); // 아래쪽 여백
    writer.writeUInt32(section.headerPadding || 4252); // 머리글 여백
    writer.writeUInt16(0); // 속성
    
    // 문단 정보 작성
    if (section.content && section.content.length > 0) {
      for (const content of section.content) {
        this.writeParagraph(writer, content);
      }
    }
    
    return writer.getBuffer();
  }
  
  /**
   * 문단 정보 쓰기
   */
  private writeParagraph(writer: BinaryWriter, paragraph: any): void {
    // 컨트롤이 있는 경우 (표 등)
    if (paragraph.controls && paragraph.controls.length > 0) {
      this.writeParagraphWithControls(writer, paragraph);
      return;
    }
    
    // 문단 헤더 레코드
    const paraHeaderSize = 22;
    writer.writeRecordHeader(HWPTAG.PARA_HEADER, paraHeaderSize);
    
    // 문단 속성
    writer.writeUInt32(0); // 문단 스타일 ID
    writer.writeUInt16(0); // 단 나누기/페이지 나누기 설정
    writer.writeUInt16(0); // 글자 모양 수
    writer.writeUInt16(paragraph.paraShapeId || 0); // 문단 모양 ID
    writer.writeUInt16(0); // 영역 시작
    writer.writeUInt16(paragraph.text.length); // 영역 끝
    writer.writeUInt16(0); // 문단 테두리 ID
    writer.writeUInt32(0); // 인스턴스 ID
    
    // 문단 텍스트 레코드
    const textBuffer = Buffer.from(paragraph.text, 'utf16le');
    writer.writeRecordHeader(HWPTAG.PARA_TEXT, textBuffer.length);
    writer.writeBytes(textBuffer);
    
    // 글자 모양 레코드 (있는 경우)
    if (paragraph.shapeBuffer && paragraph.shapeBuffer.length > 0) {
      this.writeCharShapeList(writer, paragraph.shapeBuffer, paragraph.text.length);
    }
    
    // 문단 모양 레코드 (있는 경우)
    if (paragraph.paraShapeId !== undefined || paragraph.indent !== undefined || paragraph.align !== undefined) {
      this.writeParagraphShape(writer, paragraph);
    }
  }
  
  /**
   * 문단 모양 쓰기
   */
  private writeParagraphShape(writer: BinaryWriter, paragraph: any): void {
    const recordSize = 14; // 문단 모양 크기 (기본 속성 + 여백)
    writer.writeRecordHeader(HWPTAG.PARA_SHAPE, recordSize);
    
    // 문단 모양 ID
    writer.writeUInt16(paragraph.paraShapeId || 0);
    
    // 들여쓰기 (1/7200 인치 단위)
    const indent = paragraph.indent || 0;
    writer.writeUInt16(indent * 7200 / 72); // 포인트를 HWP 단위로 변환
    
    // 정렬 방식
    let alignValue = 0; // 기본값 (양쪽 정렬)
    if (paragraph.align) {
      switch (paragraph.align) {
        case 'left': alignValue = 0; break;
        case 'center': alignValue = 1; break;
        case 'right': alignValue = 2; break;
        case 'justify': alignValue = 3; break;
      }
    }
    writer.writeUInt16(alignValue);
    
    // 여백 처리 (포인트를 HWP 단위(1/7200 인치)로 변환)
    const margin = paragraph.margin || {};
    const toHwpUnit = (pt: number) => Math.round(pt * 7200 / 72);
    
    writer.writeUInt16(toHwpUnit(margin.left || 0));   // 왼쪽 여백
    writer.writeUInt16(toHwpUnit(margin.right || 0));  // 오른쪽 여백
    writer.writeUInt16(toHwpUnit(margin.top || 0));    // 위쪽 여백
    writer.writeUInt16(toHwpUnit(margin.bottom || 0)); // 아래쪽 여백
  }
  
  /**
   * 글자 모양 목록 쓰기
   */
  private writeCharShapeList(writer: BinaryWriter, shapeBuffer: any[], textLength: number): void {
    const recordSize = shapeBuffer.length * 8;
    writer.writeRecordHeader(HWPTAG.PARA_CHAR_SHAPE, recordSize);
    
    // 각 글자 모양 속성 정보
    for (const shape of shapeBuffer) {
      writer.writeUInt32(shape.pos || 0); // 시작 위치
      writer.writeUInt32(shape.shapeIndex || 0); // 글자 모양 ID
    }
  }
  
  /**
   * 컨트롤이 있는 문단 쓰기 (표 등)
   */
  private writeParagraphWithControls(writer: BinaryWriter, paragraph: any): void {
    // 문단 헤더 레코드
    const paraHeaderSize = 22;
    writer.writeRecordHeader(HWPTAG.PARA_HEADER, paraHeaderSize);
    
    // 문단 속성
    writer.writeUInt32(0); // 문단 스타일 ID
    writer.writeUInt16(0); // 단 나누기/페이지 나누기 설정
    writer.writeUInt16(0); // 글자 모양 수
    writer.writeUInt16(0); // 문단 모양 ID
    writer.writeUInt16(0); // 영역 시작
    writer.writeUInt16(0); // 영역 끝 (텍스트 없음)
    writer.writeUInt16(0); // 문단 테두리 ID
    writer.writeUInt32(0); // 인스턴스 ID
    
    // 빈 문단 텍스트 레코드
    writer.writeRecordHeader(HWPTAG.PARA_TEXT, 0);
    
    // 컨트롤 정보 작성
    for (const control of paragraph.controls) {
      if (control.type === 'table') {
        this.writeTableControl(writer, control);
      }
      // 다른 컨트롤 타입도 필요에 따라 추가
    }
  }
  
  /**
   * 표 컨트롤 쓰기
   */
  private writeTableControl(writer: BinaryWriter, table: any): void {
    // 컨트롤 헤더 레코드
    const ctrlHeaderSize = 4;
    writer.writeRecordHeader(HWPTAG.CTRL_HEADER, ctrlHeaderSize);
    writer.writeUInt32(CONTROL_CHAR.TABLE_CONTROL); // 표 컨트롤 코드
    
    // 표 레코드
    const tableRecordSize = 28;
    writer.writeRecordHeader(HWPTAG.TABLE, tableRecordSize);
    
    // 표 속성
    writer.writeUInt16(0); // 속성
    writer.writeUInt16(0); // 행 개수
    writer.writeUInt16(0); // 열 개수
    writer.writeUInt16(0); // 선 속성
    writer.writeUInt16(0); // 테두리 채우기 ID
    writer.writeUInt16(table.rows.length); // 실제 행 개수
    writer.writeUInt16(table.rows[0]?.cells.length || 0); // 실제 열 개수
    writer.writeUInt16(0); // 셀 간격
    writer.writeUInt16(0); // 셀 스판 정보
    writer.writeUInt32(table.width || 0); // 표 너비
    writer.writeUInt32(table.height || 0); // 표 높이
    
    // 셀 목록 정보
    if (table.rows && table.rows.length > 0) {
      this.writeTableCellList(writer, table.rows);
    }
  }
  
  /**
   * 표 셀 목록 쓰기
   */
  private writeTableCellList(writer: BinaryWriter, rows: any[]): void {
    // 셀 목록 헤더 레코드
    const cellListSize = 6 + (rows.flat().length * 2);
    writer.writeRecordHeader(HWPTAG.CELL_LIST_HEADER, cellListSize);
    
    // 셀 개수
    const cellCount = rows.flat().length;
    writer.writeUInt16(cellCount);
    
    // 속성
    writer.writeUInt16(0);
    writer.writeUInt16(0);
    
    // 셀 ID 목록
    let cellID = 0;
    for (const row of rows) {
      for (const cell of row.cells) {
        writer.writeUInt16(cellID++);
      }
    }
    
    // 각 셀 정보 작성
    let cellIndex = 0;
    for (const row of rows) {
      for (const cell of row.cells) {
        this.writeTableCell(writer, cell, cellIndex++);
      }
    }
  }
  
  /**
   * 표 셀 쓰기
   */
  private writeTableCell(writer: BinaryWriter, cell: any, cellIndex: number): void {
    // 셀 속성 레코드
    const cellSize = 26;
    writer.writeRecordHeader(HWPTAG.TABLE_CELL, cellSize);
    
    // 셀 속성
    writer.writeUInt32(cellIndex); // 셀 ID
    writer.writeUInt16(0); // 행 주소
    writer.writeUInt16(0); // 열 주소
    writer.writeUInt16(cell.rowSpan || 1); // 행 병합 개수
    writer.writeUInt16(cell.colSpan || 1); // 열 병합 개수
    writer.writeUInt32(cell.width || 0); // 셀 너비
    writer.writeUInt32(cell.height || 0); // 셀 높이
    writer.writeUInt16(cell.borderFillID || 0); // 테두리 채우기 ID
    writer.writeUInt16(0); // 추가 속성
    
    // 셀 내용을 담은 문단
    this.writeCellContent(writer, cell);
  }
  
  /**
   * 셀 내용 쓰기
   */
  private writeCellContent(writer: BinaryWriter, cell: any): void {
    // 리스트 헤더 레코드 (문단 리스트를 담는 컨테이너)
    writer.writeRecordHeader(HWPTAG.LIST_HEADER, 6);
    writer.writeUInt16(1); // 문단 개수
    writer.writeUInt16(0); // 속성 1
    writer.writeUInt16(0); // 속성 2
    
    // 문단 헤더 레코드
    const paraHeaderSize = 22;
    writer.writeRecordHeader(HWPTAG.PARA_HEADER, paraHeaderSize);
    
    // 문단 속성
    writer.writeUInt32(0); // 문단 스타일 ID
    writer.writeUInt16(0); // 단 나누기/페이지 나누기 설정
    writer.writeUInt16(0); // 글자 모양 수
    writer.writeUInt16(0); // 문단 모양 ID
    writer.writeUInt16(0); // 영역 시작
    writer.writeUInt16(cell.content.length); // 영역 끝
    writer.writeUInt16(0); // 문단 테두리 ID
    writer.writeUInt32(0); // 인스턴스 ID
    
    // 문단 텍스트 레코드
    const textBuffer = Buffer.from(cell.content, 'utf16le');
    writer.writeRecordHeader(HWPTAG.PARA_TEXT, textBuffer.length);
    writer.writeBytes(textBuffer);
    
    // 글자 모양 (가운데 정렬 등의 서식이 필요한 경우)
    if (cell.align) {
      const recordSize = 8;
      writer.writeRecordHeader(HWPTAG.PARA_CHAR_SHAPE, recordSize);
      writer.writeUInt32(0); // 시작 위치
      writer.writeUInt32(0); // 글자 모양 ID
    }
  }
  
  /**
   * HWP 바이너리 파일 생성
   */
  generateHWPFile(document: any): Buffer {
    // CFB(Compound File Binary) 포맷 초기화
    const cfbFile = cfb.utils.cfb_new(); // book_new 대신 cfb_new 사용
    
    // FileHeader 스트림 생성
    const fileHeader = this.createFileHeader();
    cfb.utils.cfb_add(cfbFile, 'FileHeader', fileHeader); // book_append_sheet 대신 cfb_add 사용
    
    // DocInfo 스트림 생성
    const docInfo = this.createDocInfo(document.info);
    cfb.utils.cfb_add(cfbFile, 'DocInfo', docInfo);
    
    // BodyText 스트림 생성 (각 섹션별)
    const bodyTextStreams = this.createBodyText(document.sections);
    bodyTextStreams.forEach((stream, index) => {
      cfb.utils.cfb_add(cfbFile, `BodyText/Section${index}`, stream);
    });
    
    // 바이너리 파일 생성
    return cfb.write(cfbFile, { type: 'buffer' });
  }
}

// 바이너리 생성 함수
export function generateHWPBinary(document: any): Buffer {
  const generator = new HWPBinaryGenerator();
  return generator.generateHWPFile(document);
} 