/**
 * 마크다운을 HWP로 변환하는 라이브러리 테스트
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { testMarkdownToHWP } from '../services/hwp-md2hwp.js';

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log("=== 마크다운 → HWP 변환 테스트 ===");
  
  // 테스트할 마크다운 데이터
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

* 항목 1
* 항목 2
  * 하위 항목 2-1
  * 하위 항목 2-2
* 항목 3

## 텍스트 서식 테스트

일반 텍스트와 **굵은 텍스트**, *기울임 텍스트*, ~~취소선~~, \`코드\` 등의 
다양한 서식을 테스트합니다.
`;

  try {
    // 출력 경로 설정
    const outputPath = path.join(__dirname, 'output.hwp');
    
    // 변환 테스트 실행
    const resultPath = await testMarkdownToHWP(testMarkdown, outputPath);
    
    console.log("\n변환 결과:");
    console.log(`- 결과 파일: ${resultPath}`);
    
    // JSON 결과 파일 읽기 및 구조 확인
    if (resultPath.endsWith('.json')) {
      const jsonResult = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      console.log("\n문서 정보:");
      console.log(`- 버전: ${jsonResult.header.version.major}.${jsonResult.header.version.minor}`);
      console.log(`- 구역 수: ${jsonResult.sections.length}`);
      
      if (jsonResult.sections.length > 0) {
        const section = jsonResult.sections[0];
        console.log(`- 콘텐츠 항목 수: ${section.content.length}`);
        
        // 테이블 정보 확인
        const tables = section.content.filter((item: any) => 
          item.controls && item.controls.some((ctrl: any) => ctrl.type === 'table')
        );
        
        if (tables.length > 0) {
          console.log(`- 테이블 수: ${tables.length}`);
          
          // 첫 번째 테이블 정보
          const firstTable = tables[0].controls.find((ctrl: any) => ctrl.type === 'table');
          if (firstTable) {
            console.log("\n첫 번째 테이블 정보:");
            console.log(`- 행 수: ${firstTable.rows.length}`);
            console.log(`- 열 수: ${firstTable.rows[0].cells.length}`);
            console.log(`- 헤더 셀 내용: ${firstTable.rows[0].cells.map((cell: any) => cell.content).join(', ')}`);
          }
        }
      }
    }
    
    console.log("\n=== 테스트 완료 ===");
  } catch (error) {
    console.error("테스트 실행 중 오류:", error);
  }
}

// 테스트 실행
runTest().catch(error => {
  console.error("테스트 실행 중 오류:", error);
}); 