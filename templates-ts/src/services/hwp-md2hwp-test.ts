/**
 * 마크다운을 HWP로 변환하는 라이브러리 테스트 코드
 */

import { MarkdownToHWP } from './hwp-md2hwp.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ES 모듈에서 현재 파일이 직접 실행되었는지 확인하는 방법
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

// 테스트 마크다운 내용
const testMarkdown = `
# 마크다운 → HWP 변환 테스트

이 문서는 마크다운에서 HWP로의 변환을 테스트하기 위한 샘플 문서입니다.

## 표 테스트

| 항목 | 설명 | 비고 |
|------|------|------|
| 제목 | 문서의 제목 | 필수 항목 |
| 작성자 | 문서 작성자 | 선택 사항 |
| 날짜 | 작성 일자 | YYYY-MM-DD 형식 |

## 목록 테스트

### 순서 없는 목록:
* 항목 1
* 항목 2
  * 중첩 항목 2.1
  * 중첩 항목 2.2
* 항목 3

### 순서 있는 목록:
1. 첫 번째 항목
2. 두 번째 항목
   1. 중첩 항목 2-1
   2. 중첩 항목 2-2
3. 세 번째 항목

## 텍스트 서식 테스트

일반 텍스트와 **굵은 텍스트**, *기울임 텍스트*, ~~취소선~~, \`코드\` 등의 
다양한 서식을 테스트합니다.

## 링크 테스트

[링크 텍스트](https://example.com)

## 이미지 테스트

![이미지 설명](https://via.placeholder.com/150)
`;

// 테스트 헬퍼 함수
async function testMarkdownToHWP(markdownText: string, outputPath: string): Promise<string> {
  const converter = new MarkdownToHWP();
  converter.parseMarkdown(markdownText);
  return converter.generateHWPFile(outputPath);
}

// 테스트 실행 함수
async function runTest() {
  console.log('=== 마크다운 → HWP 변환 테스트 ===');
  
  try {
    // 테스트 결과 출력 경로
    const outputPath = path.join(__dirname, 'output.hwp');
    
    // 마크다운을 HWP로 변환
    const resultPath = await testMarkdownToHWP(testMarkdown, outputPath);
    
    // 테스트 결과 출력
    printTestResult(resultPath);
    
    console.log('\n=== 테스트 완료 ===');
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
    throw error;
  }
}

// 테스트 결과 출력 함수
function printTestResult(outputPath: string) {
  console.log('\n변환 결과:');
  console.log(`- 결과 파일: ${outputPath}`);

  // JSON 결과 파일 읽기
  const jsonPath = outputPath.replace(/\.hwp$/, '.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log('\n문서 정보:');
      console.log(`- 버전: ${jsonData.header.version.major}.${jsonData.header.version.minor}`);
      console.log(`- 구역 수: ${jsonData.sections.length}`);
      
      if (jsonData.sections.length > 0 && jsonData.sections[0].content) {
        console.log(`- 콘텐츠 항목 수: ${jsonData.sections[0].content.length}`);
        
        // 테이블 정보 확인
        const tables = jsonData.sections[0].content.filter((item: any) => 
          item.controls && item.controls.some((ctrl: any) => ctrl.type === 'table')
        );
        
        if (tables.length > 0) {
          console.log(`- 테이블 수: ${tables.length}`);
          
          // 첫 번째 테이블 정보 출력
          const firstTable = tables[0].controls.find((ctrl: any) => ctrl.type === 'table');
          if (firstTable && firstTable.rows) {
            console.log('\n첫 번째 테이블 정보:');
            console.log(`- 행 수: ${firstTable.rows.length}`);
            console.log(`- 열 수: ${firstTable.rows[0]?.cells.length || 0}`);
            
            // 헤더 셀 내용 출력
            if (firstTable.rows[0]?.cells) {
              const headerContents = firstTable.rows[0].cells.map((cell: any) => cell.content);
              console.log(`- 헤더 셀 내용: ${headerContents.join(', ')}`);
            }
          }
        }
        
        // 목록 정보 확인
        const listItems = jsonData.sections[0].content.filter((item: any) => 
          item.text && (item.text.startsWith('• ') || item.text.startsWith('◦ ') || 
                       /^\d+\.\s/.test(item.text))
        );
        
        if (listItems.length > 0) {
          console.log(`\n목록 항목 수: ${listItems.length}`);
          console.log('- 첫 번째 목록 항목: ' + listItems[0].text);
          
          // 들여쓰기 및 정렬 확인
          if (listItems[0].indent !== undefined) {
            console.log(`- 들여쓰기: ${listItems[0].indent}pt`);
          }
          if (listItems[0].align) {
            console.log(`- 정렬: ${listItems[0].align}`);
          }
        }
        
        // 제목 정보 확인
        const headings = jsonData.sections[0].content.filter((item: any) => 
          item.shapeBuffer && item.shapeBuffer.some((shape: any) => shape.shapeIndex > 0)
        );
        
        if (headings.length > 0) {
          console.log(`\n제목 수: ${headings.length}`);
          console.log('- 첫 번째 제목: ' + headings[0].text);
          console.log(`- 정렬: ${headings[0].align || '기본값'}`);
        }
      }
    } catch (error) {
      console.error('JSON 파일 읽기 오류:', error);
    }
  }
}

// 명령행에서 직접 실행된 경우 테스트 실행
if (isMainModule) {
  runTest().catch(error => {
    console.error("테스트 실행 중 오류:", error);
    process.exit(1);
  });
}

export { runTest }; 