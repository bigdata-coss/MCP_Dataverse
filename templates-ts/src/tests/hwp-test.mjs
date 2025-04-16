// HWP 테스트 스크립트 (ESM 모듈)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as marked from 'marked';

// __dirname, __filename 설정 (ESM에서는 기본적으로 사용할 수 없음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 간단한 마크다운 테스트
const testMarkdown = `
# 테스트 문서

## 표 테스트

| 열1 | 열2 | 열3 |
|-----|-----|-----|
| 값1 | 값2 | 값3 |
| 값4 | 값5 | 값6 |
`;

// hwp.js 사용 가능 여부 확인
let hwp;
try {
  // ESM에서 동적 import 사용
  hwp = await import('hwp.js');
  console.log("hwp.js 가져오기 성공");
  
  // hwp.js의 기능 테스트
  console.log("사용 가능한 클래스/함수:");
  Object.keys(hwp).forEach(key => {
    console.log(`- ${key}: ${typeof hwp[key]}`);
  });
  
  // HWPDocument 클래스 테스트
  if (hwp.HWPDocument) {
    const doc = new hwp.HWPDocument();
    console.log("HWPDocument 인스턴스 생성 성공");
    
    // 사용 가능한 메소드 확인
    console.log("HWPDocument 메소드:");
    Object.getOwnPropertyNames(Object.getPrototypeOf(doc))
      .filter(prop => typeof doc[prop] === 'function')
      .forEach(method => {
        console.log(`- ${method}`);
      });
  }
} catch (error) {
  console.log("hwp.js 라이브러리 사용 불가:", error.message);
  hwp = null;
}

// 마크다운 파싱 기능 테스트
console.log("\n마크다운 파싱 테스트:");
const tokens = marked.lexer(testMarkdown);
console.log(`토큰 개수: ${tokens.length}`);
console.log("토큰 타입:");
tokens.forEach((token, i) => {
  console.log(`${i}: ${token.type}`);
});

// 테이블 토큰 처리 테스트
const tableToken = tokens.find(token => token.type === 'table');
if (tableToken) {
  console.log("\n테이블 토큰 구조:");
  console.log(`헤더: ${JSON.stringify(tableToken.header)}`);
  console.log(`행 수: ${tableToken.rows.length}`);
  console.log(`첫 번째 행: ${JSON.stringify(tableToken.rows[0])}`);
  
  // 테이블 토큰에서 텍스트 추출 테스트
  console.log("\n테이블 텍스트 추출:");
  
  // 헤더 행
  let tableText = "| ";
  tableToken.header.forEach(cell => {
    const cellText = typeof cell === 'object' && cell.text ? cell.text : String(cell);
    tableText += `${cellText} | `;
  });
  console.log(tableText);
  
  // 구분선
  tableText = "| ";
  tableToken.header.forEach(() => {
    tableText += "------ | ";
  });
  console.log(tableText);
  
  // 데이터 행
  tableToken.rows.forEach(row => {
    tableText = "| ";
    row.forEach(cell => {
      const cellText = typeof cell === 'object' && cell.text ? cell.text : String(cell);
      tableText += `${cellText} | `;
    });
    console.log(tableText);
  });
}

// hwp.js 없이 HWP 파일 생성 테스트 (텍스트 기반)
try {
  const outputPath = path.join(__dirname, 'test-output.hwp');
  const content = `테스트 문서
  
${tableToken ? 
  `표 내용:
  
${tableToken.header.join(' | ')}
${'---'.repeat(tableToken.header.length)}
${tableToken.rows.map(row => row.join(' | ')).join('\n')}` 
  : '표 토큰 없음'}`;
  
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`\n파일이 생성됨: ${outputPath}`);
} catch (error) {
  console.error("파일 생성 오류:", error);
} 