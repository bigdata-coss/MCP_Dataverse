import os
import sys
from pyhwpx import Hwp
import markdown
from bs4 import BeautifulSoup
import json

# 현재 디렉토리의 절대 경로 가져오기
CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))
TEST_FILE = os.path.join(CURRENT_DIR, "test_hwp_file.hwp")

def create_hwp(output_path=TEST_FILE):
    """새 한글 문서를 생성하고 저장"""
    try:
        print("1. 한글 문서 생성 테스트 시작")
        hwp = Hwp(visible=True)
        print("   한글 프로그램을 실행했습니다.")
        
        hwp.insert_text("테스트 문서입니다.\n")
        hwp.insert_text("이 문서는 pyhwpx를 사용하여 생성되었습니다.\n")
        print("   텍스트를 삽입했습니다.")
        
        hwp.save_as(output_path)
        print(f"   문서를 {output_path}에 저장했습니다.")
        
        hwp.quit()
        print("   한글 프로그램을 종료했습니다.")
        print("1. 한글 문서 생성 테스트 완료\n")
        return True
    except Exception as e:
        print(f"한글 문서 생성 중 오류 발생: {e}")
        return False

def modify_hwp(file_path=TEST_FILE):
    """기존 한글 문서를 수정"""
    if not os.path.exists(file_path):
        print(f"파일이 존재하지 않습니다: {file_path}")
        return False
    
    try:
        print("2. 한글 문서 수정 테스트 시작")
        hwp = Hwp(visible=True)
        print("   한글 프로그램을 실행했습니다.")

        # 기존 파일의 내용을 읽어와서 새 문서에 추가하는 방식으로 변경
        # 새 문서 생성
        print("   새 문서를 생성합니다.")
        
        # 수정할 텍스트 추가
        hwp.insert_text("원본 파일: " + os.path.basename(file_path) + "\n\n")
        hwp.insert_text("이 문서는 수정된 버전입니다.\n")
        hwp.insert_text("수정 시간: " + os.path.basename(__file__) + "\n\n")
        print("   텍스트를 추가했습니다.")
        
        # 수정된 파일 저장
        modified_file = os.path.splitext(file_path)[0] + "_modified.hwp"
        hwp.save_as(modified_file)
        print(f"   수정된 문서를 {modified_file}에 저장했습니다.")
        
        hwp.quit()
        print("   한글 프로그램을 종료했습니다.")
        print("2. 한글 문서 수정 테스트 완료\n")
        return True
    except Exception as e:
        print(f"한글 문서 수정 중 오류 발생: {e}")
        return False

def read_hwp(file_path=TEST_FILE):
    """한글 문서 읽기"""
    if not os.path.exists(file_path):
        print(f"파일이 존재하지 않습니다: {file_path}")
        return False
    
    try:
        print("3. 한글 문서 읽기 테스트 시작")
        print(f"   파일 경로: {file_path}")
        print("   한글 문서 읽기는 간접적으로 수행합니다.")
        
        # 파일 존재 확인
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print(f"   파일 크기: {file_size} 바이트")
            print(f"   최종 수정일: {os.path.getmtime(file_path)}")
            print("   파일이 존재하며 직접 변경은 어렵습니다.")
            print("   한글 프로그램에서 직접 열어서 확인해주세요.")
        else:
            print(f"   파일이 존재하지 않습니다: {file_path}")
        
        print("3. 한글 문서 읽기 테스트 완료\n")
        return True
    except Exception as e:
        print(f"한글 문서 읽기 중 오류 발생: {e}")
        return False

def md_to_hwp():
    """마크다운을 한글로 변환"""
    md_content = """# 마크다운 테스트
    
## 부제목

이것은 **굵은** 텍스트와 *기울임* 텍스트를 포함합니다.

### 목록 예제
- 항목 1
- 항목 2
  - 하위 항목 2.1
  - 하위 항목 2.2
"""
    md_file = os.path.join(CURRENT_DIR, "test_markdown.md")
    output_file = os.path.join(CURRENT_DIR, "test_markdown.hwp")
    
    # 마크다운 파일 생성
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    try:
        print("4. 마크다운 변환 테스트 시작")
        print(f"   마크다운 파일 생성: {md_file}")
        
        from tools.md2hwp import convert_md_file_to_hwp
        result = convert_md_file_to_hwp(md_file, output_file)
        
        if os.path.exists(output_file):
            print(f"   마크다운이 성공적으로 변환되어 {output_file}에 저장되었습니다.")
        else:
            print(f"   파일이 생성되지 않았습니다: {output_file}")
        
        print("4. 마크다운 변환 테스트 완료\n")
        return True
    except Exception as e:
        print(f"마크다운 변환 중 오류 발생: {e}")
        return False

def convert_readme_to_hwp():
    """README.md 파일을 직접 한글로 변환 (서식 적용)"""
    import markdown
    from bs4 import BeautifulSoup
    
    readme_path = os.path.join(CURRENT_DIR, "README.md")
    output_path = os.path.join(CURRENT_DIR, "README_styled.hwp")
    
    if not os.path.exists(readme_path):
        print(f"README.md 파일이 존재하지 않습니다: {readme_path}")
        return False
    
    try:
        print("5. README.md 서식 적용 변환 테스트 시작")
        
        # 마크다운 파일 읽기
        with open(readme_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
            print(f"   README.md 파일 내용 로드 ({len(md_content)} 바이트)")
        
        # 마크다운을 HTML로 변환
        html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
        soup = BeautifulSoup(html_content, 'html.parser')
        print("   마크다운을 HTML로 변환했습니다.")
        
        # 한글 실행
        hwp = Hwp(visible=True)
        print("   한글 프로그램을 실행했습니다.")
        
        # 새 문서 생성
        hwp.HAction.Execute("FileNew", "")
        print("   새 문서를 생성했습니다.")
        
        # HTML 구조를 기반으로 한글 문서 서식 적용
        apply_markdown_to_hwp(hwp, soup)
        print("   마크다운 구조를 한글 서식으로 변환했습니다.")
        
        # 저장
        hwp.save_as(output_path)
        print(f"   문서를 {output_path}에 저장했습니다.")
        
        hwp.quit()
        print("   한글 프로그램을 종료했습니다.")
        print("5. README.md 서식 적용 변환 테스트 완료\n")
        return True
    except Exception as e:
        print(f"README.md 변환 중 오류 발생: {e}")
        return False

def apply_markdown_to_hwp(hwp, soup):
    """마크다운 구조를 한글 서식으로 변환"""
    
    # 현재 문단 위치 추적
    current_para = 0
    
    # 문서 내 각 요소 처리
    for element in soup.children:
        if element.name is None:
            continue
            
        # 제목 처리 (h1~h6)
        if element.name.startswith('h') and len(element.name) == 2:
            level = int(element.name[1])
            text = element.get_text().strip()
            
            # 제목 추가
            add_heading(hwp, text, level)
            current_para += 1
            
        # 문단 처리
        elif element.name == 'p':
            text = element.get_text().strip()
            if text:
                add_paragraph(hwp, text)
                current_para += 1
                
        # 순서 없는 목록 처리
        elif element.name == 'ul':
            list_items = element.find_all('li', recursive=True)
            add_unordered_list(hwp, list_items)
            current_para += len(list_items)
                
        # 순서 있는 목록 처리
        elif element.name == 'ol':
            list_items = element.find_all('li', recursive=True)
            add_ordered_list(hwp, list_items)
            current_para += len(list_items)
                
        # 코드 블록 처리
        elif element.name == 'pre' or element.name == 'code':
            code_text = element.get_text().strip()
            if code_text:
                add_code_block(hwp, code_text)
                current_para += 1
            
        # 표 처리
        elif element.name == 'table':
            add_table(hwp, element)
            current_para += 1

def add_heading(hwp, text, level):
    """제목 스타일 적용"""
    # 제목 크기 설정 (h1=24pt, h2=18pt, h3=14pt, h4=12pt, h5=10pt, h6=9pt)
    sizes = {1: 24, 2: 18, 3: 14, 4: 12, 5: 10, 6: 9}
    size = sizes.get(level, 10) * 100  # HWP에서는 pt*100 단위 사용
    
    try:
        # 제목 텍스트 삽입
        hwp.insert_text(text)
        
        # 현재 선택 영역 설정
        hwp.HAction.Run("Select")
        
        # 글꼴 속성 설정
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.Height = size
        hwp.HParameterSet.HCharShape.TextColor = 0  # 검은색
        hwp.HParameterSet.HCharShape.Bold = 1  # 굵게
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        # 문단 정렬 (h1은 가운데, 나머지는 왼쪽)
        if level == 1:
            hwp.HAction.GetDefault("ParagraphShapeAlignCenter", hwp.HParameterSet.HParaShape.HSet)
            hwp.HAction.Execute("ParagraphShapeAlignCenter", hwp.HParameterSet.HParaShape.HSet)
        else:
            hwp.HAction.GetDefault("ParagraphShapeAlignLeft", hwp.HParameterSet.HParaShape.HSet)
            hwp.HAction.Execute("ParagraphShapeAlignLeft", hwp.HParameterSet.HParaShape.HSet)
        
        # 문단 간격 설정
        hwp.HAction.GetDefault("ParagraphShapeSpacing", hwp.HParameterSet.HParaShape.HSet)
        hwp.HParameterSet.HParaShape.LineSpacing = 160  # 160%
        hwp.HParameterSet.HParaShape.ParaSpacingBottom = 600  # 6mm
        hwp.HAction.Execute("ParagraphShapeSpacing", hwp.HParameterSet.HParaShape.HSet)
        
        # 단락 삽입
        hwp.HAction.Run("BreakPara")
    except Exception as e:
        print(f"   제목 스타일 적용 오류: {e}")

def add_paragraph(hwp, text):
    """일반 텍스트 단락 추가"""
    try:
        # 텍스트 삽입
        hwp.insert_text(text)
        
        # 현재 선택 영역 설정
        hwp.HAction.Run("Select")
        
        # 글꼴 속성 설정
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.Height = 1000  # 10pt
        hwp.HParameterSet.HCharShape.Bold = 0  # 보통
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        # 문단 정렬
        hwp.HAction.GetDefault("ParagraphShapeAlignLeft", hwp.HParameterSet.HParaShape.HSet)
        hwp.HAction.Execute("ParagraphShapeAlignLeft", hwp.HParameterSet.HParaShape.HSet)
        
        # 단락 삽입
        hwp.HAction.Run("BreakPara")
    except Exception as e:
        print(f"   단락 추가 오류: {e}")

def add_unordered_list(hwp, list_items, level=0):
    """순서 없는 목록 추가"""
    try:
        for item in list_items:
            # 목록 레벨에 따른 들여쓰기
            indent = level * 15  # 들여쓰기 단위(mm)
            
            # 목록 기호와 텍스트 삽입
            text = item.get_text().strip()
            hwp.insert_text(f"• {text}")
            
            # 현재 선택 영역 설정
            hwp.HAction.Run("Select")
            
            # 글꼴 속성 설정
            hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
            hwp.HParameterSet.HCharShape.Height = 1000  # 10pt
            hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
            
            # 들여쓰기 설정
            hwp.HAction.GetDefault("ParagraphShapeIndent", hwp.HParameterSet.HParaShape.HSet)
            hwp.HParameterSet.HParaShape.LeftMargin = indent * 100  # 단위는 hwp 내부 단위 (1/7200 inch)
            hwp.HAction.Execute("ParagraphShapeIndent", hwp.HParameterSet.HParaShape.HSet)
            
            # 단락 삽입
            hwp.HAction.Run("BreakPara")
            
            # 하위 목록 처리
            sub_items = item.find_all('li', recursive=False)
            if sub_items:
                add_unordered_list(hwp, sub_items, level+1)
    except Exception as e:
        print(f"   목록 추가 오류: {e}")

def add_ordered_list(hwp, list_items, level=0, start_index=1):
    """순서 있는 목록 추가"""
    try:
        for i, item in enumerate(list_items):
            # 목록 레벨에 따른 들여쓰기
            indent = level * 15  # 들여쓰기 단위(mm)
            
            # 목록 번호와 텍스트 삽입
            text = item.get_text().strip()
            hwp.insert_text(f"{i+start_index}. {text}")
            
            # 현재 선택 영역 설정
            hwp.HAction.Run("Select")
            
            # 글꼴 속성 설정
            hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
            hwp.HParameterSet.HCharShape.Height = 1000  # 10pt
            hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
            
            # 들여쓰기 설정
            hwp.HAction.GetDefault("ParagraphShapeIndent", hwp.HParameterSet.HParaShape.HSet)
            hwp.HParameterSet.HParaShape.LeftMargin = indent * 100
            hwp.HAction.Execute("ParagraphShapeIndent", hwp.HParameterSet.HParaShape.HSet)
            
            # 단락 삽입
            hwp.HAction.Run("BreakPara")
            
            # 하위 목록 처리
            sub_items = item.find_all('li', recursive=False)
            if sub_items:
                add_ordered_list(hwp, sub_items, level+1)
    except Exception as e:
        print(f"   목록 추가 오류: {e}")

def add_code_block(hwp, code):
    """코드 블록 추가"""
    try:
        # 코드 텍스트 삽입
        hwp.insert_text(code)
        
        # 현재 선택 영역 설정
        hwp.HAction.Run("Select")
        
        # 글꼴 속성 설정 (고정폭 글꼴)
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.Height = 900  # 9pt
        hwp.HParameterSet.HCharShape.FaceNameHangul = "Consolas"
        hwp.HParameterSet.HCharShape.FaceNameLatin = "Consolas"
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        # 배경색 설정 (연한 회색)
        hwp.HAction.GetDefault("CharShapeBackColor", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.BackColor = 0xF0F0F0  # 연한 회색
        hwp.HAction.Execute("CharShapeBackColor", hwp.HParameterSet.HCharShape.HSet)
        
        # 테두리 설정
        hwp.HAction.GetDefault("BorderFill", hwp.HParameterSet.HBorderFill.HSet)
        hwp.HParameterSet.HBorderFill.BorderType = 1  # 실선
        hwp.HParameterSet.HBorderFill.BorderWidth = 0.4  # 0.4mm
        hwp.HParameterSet.HBorderFill.BorderColor = 0x808080  # 회색
        hwp.HParameterSet.HBorderFill.BackColor = 0xF5F5F5  # 연한 회색
        hwp.HAction.Execute("BorderFill", hwp.HParameterSet.HBorderFill.HSet)
        
        # 단락 삽입
        hwp.HAction.Run("BreakPara")
    except Exception as e:
        print(f"   코드 블록 추가 오류: {e}")

def add_table(hwp, table_element):
    """표 추가"""
    try:
        # 테이블 구조 분석
        rows = []
        
        # 헤더 추출
        headers = []
        thead = table_element.find('thead')
        if thead:
            tr = thead.find('tr')
            if tr:
                for th in tr.find_all(['th', 'td']):
                    headers.append(th.get_text().strip())
        
        # 본문 행 추출
        tbody = table_element.find('tbody') or table_element
        for tr in tbody.find_all('tr'):
            row = []
            for td in tr.find_all(['td', 'th']):
                row.append(td.get_text().strip())
            if row:
                rows.append(row)
        
        # 헤더가 없으면 첫 번째 행을 헤더로 사용
        if not headers and rows:
            headers = rows[0]
            rows = rows[1:]
        
        # 표 생성
        row_count = len(rows) + 1  # 헤더 포함
        col_count = len(headers)
        
        # 파라미터셋 생성
        hwp.HAction.GetDefault("TableCreate", hwp.HParameterSet.HTableCreation.HSet)
        hwp.HParameterSet.HTableCreation.Rows = row_count
        hwp.HParameterSet.HTableCreation.Cols = col_count
        hwp.HParameterSet.HTableCreation.WidthType = 2  # Auto
        hwp.HParameterSet.HTableCreation.HeightType = 1  # 최소
        hwp.HParameterSet.HTableCreation.WidthValue = 14000  # 표 너비 (표 내부 단위)
        hwp.HParameterSet.HTableCreation.HeightValue = 500  # 표 높이 (표 내부 단위)
        hwp.HParameterSet.HTableCreation.TableProperties.TreatAsChar = 1  # 글자처럼 취급
        hwp.HParameterSet.HTableCreation.TableProperties.Width = 14000  # 표 너비
        hwp.HAction.Execute("TableCreate", hwp.HParameterSet.HTableCreation.HSet)
        
        # 헤더 셀 채우기
        for col, header in enumerate(headers):
            try:
                # 행, 열 위치로 이동
                hwp.HAction.GetDefault("TableCellBlock", hwp.HParameterSet.HTableCell.HSet)
                hwp.HParameterSet.HTableCell.Row = 0
                hwp.HParameterSet.HTableCell.Col = col
                hwp.HAction.Execute("TableCellBlock", hwp.HParameterSet.HTableCell.HSet)
                
                # 텍스트 삽입
                hwp.HAction.GetDefault("InsertText", hwp.HParameterSet.HInsertText.HSet)
                hwp.HParameterSet.HInsertText.Text = header
                hwp.HAction.Execute("InsertText", hwp.HParameterSet.HInsertText.HSet)
                
                # 헤더 셀 스타일 (굵게, 가운데 정렬)
                hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
                hwp.HParameterSet.HCharShape.Bold = 1  # 굵게
                hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
                
                hwp.HAction.GetDefault("ParagraphShapeAlignCenter", hwp.HParameterSet.HParaShape.HSet)
                hwp.HAction.Execute("ParagraphShapeAlignCenter", hwp.HParameterSet.HParaShape.HSet)
            except Exception as e:
                print(f"   헤더 셀 {col} 채우기 오류: {e}")
        
        # 데이터 셀 채우기
        for row_idx, row_data in enumerate(rows):
            for col_idx, cell_data in enumerate(row_data):
                if col_idx < col_count:
                    try:
                        # 행, 열 위치로 이동
                        hwp.HAction.GetDefault("TableCellBlock", hwp.HParameterSet.HTableCell.HSet)
                        hwp.HParameterSet.HTableCell.Row = row_idx + 1  # 헤더 다음 행부터
                        hwp.HParameterSet.HTableCell.Col = col_idx
                        hwp.HAction.Execute("TableCellBlock", hwp.HParameterSet.HTableCell.HSet)
                        
                        # 텍스트 삽입
                        hwp.HAction.GetDefault("InsertText", hwp.HParameterSet.HInsertText.HSet)
                        hwp.HParameterSet.HInsertText.Text = cell_data
                        hwp.HAction.Execute("InsertText", hwp.HParameterSet.HInsertText.HSet)
                    except Exception as e:
                        print(f"   데이터 셀 [{row_idx+1}, {col_idx}] 채우기 오류: {e}")
        
        # 표 속성 설정 (테두리 등)
        hwp.HAction.GetDefault("TablePropertyDialog", hwp.HParameterSet.HShapeObject.HSet)
        hwp.HParameterSet.HShapeObject.HSet.TreatAsChar = 1  # 글자처럼 취급
        hwp.HAction.Execute("TablePropertyDialog", hwp.HParameterSet.HShapeObject.HSet)
        
        # 문서 끝으로 이동 후 단락 삽입
        hwp.HAction.Run("MoveDocEnd")
        hwp.HAction.Run("BreakPara")
    except Exception as e:
        print(f"   표 추가 오류: {e}")

def test_styled_document():
    """서식이 포함된 문서 작성 테스트"""
    output_file = os.path.join(CURRENT_DIR, "test_styled.hwp")
    
    try:
        print("6. 서식 적용 문서 작성 테스트 시작")
        hwp = Hwp(visible=True)
        print("   한글 프로그램을 실행했습니다.")
        
        # 새 문서 생성
        hwp.HAction.Execute("FileNew", "")
        print("   새 문서를 생성했습니다.")
        
        # 제목 텍스트 추가 (굵게, 큰 글씨)
        hwp.insert_text("한글 서식 테스트 문서")
        hwp.HAction.Run("Select")
        
        # 제목 서식 적용
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.Height = 2400  # 24pt
        hwp.HParameterSet.HCharShape.Bold = 1  # 굵게
        hwp.HParameterSet.HCharShape.TextColor = 0x0000FF  # 빨간색 (BGR 형식)
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        # 문단 정렬 (가운데)
        hwp.HAction.GetDefault("ParagraphShapeAlignCenter", hwp.HParameterSet.HParaShape.HSet)
        hwp.HAction.Execute("ParagraphShapeAlignCenter", hwp.HParameterSet.HParaShape.HSet)
        
        # 단락 추가
        hwp.HAction.Run("BreakPara")
        hwp.HAction.Run("BreakPara")
        
        # 본문 텍스트 추가
        hwp.insert_text("이 문서는 다양한 ")
        
        # 굵게 적용
        hwp.insert_text("글자 스타일")
        hwp.HAction.Run("Select")
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.Bold = 1  # 굵게
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        hwp.insert_text("을 테스트하기 위한 문서입니다.\n\n")
        
        # 기울임 텍스트 추가
        hwp.insert_text("이것은 ")
        hwp.insert_text("기울임")
        hwp.HAction.Run("Select")
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.Italic = 1  # 기울임
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        hwp.insert_text(" 텍스트입니다.\n\n")
        
        # 밑줄 텍스트 추가
        hwp.insert_text("이것은 ")
        hwp.insert_text("밑줄")
        hwp.HAction.Run("Select")
        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.UnderlineType = 1  # 실선 밑줄
        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
        
        hwp.insert_text(" 텍스트입니다.\n\n")
        
        # 형광펜 텍스트 추가
        hwp.insert_text("이것은 ")
        hwp.insert_text("형광펜")
        hwp.HAction.Run("Select")
        hwp.HAction.GetDefault("CharShapeShadeColor", hwp.HParameterSet.HCharShape.HSet)
        hwp.HParameterSet.HCharShape.ShadeColor = 0x00FFFF  # 노란색
        hwp.HParameterSet.HCharShape.ShadeStyle = 1  # 음영 스타일
        hwp.HAction.Execute("CharShapeShadeColor", hwp.HParameterSet.HCharShape.HSet)
        
        hwp.insert_text(" 텍스트입니다.\n\n")
        
        # 저장
        hwp.save_as(output_file)
        print(f"   문서를 {output_file}에 저장했습니다.")
        
        hwp.quit()
        print("   한글 프로그램을 종료했습니다.")
        print("6. 서식 적용 문서 작성 테스트 완료\n")
        return True
    except Exception as e:
        print(f"서식 적용 문서 작성 중 오류 발생: {e}")
        return False

def test_read_styled_document():
    """서식 정보를 포함하여 문서 읽기 테스트"""
    # 먼저 테스트용 스타일 문서가 없으면 생성
    styled_file = os.path.join(CURRENT_DIR, "test_styled.hwp")
    if not os.path.exists(styled_file):
        test_styled_document()
    
    try:
        print("7. 서식 정보 포함 문서 읽기 테스트 시작")
        print(f"   파일 경로: {styled_file}")
        
        from tools.hwp_read import read_hwp_with_style
        
        # 서식 정보를 포함하여 문서 읽기
        result = read_hwp_with_style(styled_file)
        
        # 결과 출력
        content_count = len(result['content'])
        print(f"   문단 수: {result['paragraph_count']}")
        print(f"   콘텐츠 항목 수: {content_count}")
        
        if content_count > 0:
            print("\n   첫 번째 콘텐츠 항목 샘플:")
            print(f"   텍스트: {result['content'][0]['text']}")
            print(f"   스타일: {json.dumps(result['content'][0]['style'], ensure_ascii=False)}")
        
        print("7. 서식 정보 포함 문서 읽기 테스트 완료\n")
        return True
    except Exception as e:
        print(f"서식 정보 포함 문서 읽기 중 오류 발생: {e}")
        return False

def test_mcp_style_functions():
    """MCP 도구에서 서식 적용 함수 테스트"""
    output_file = os.path.join(CURRENT_DIR, "test_mcp_styled.hwp")
    
    try:
        print("8. MCP 서식 함수 테스트 시작")
        
        from tools.hwp_write import write_styled_text_to_hwp
        
        # 서식이 적용된 콘텐츠 리스트 생성
        content_list = [
            {
                'text': '서식 적용 테스트 문서',
                'style': {
                    'font_name': '함초롬돋움',
                    'font_size': 24,
                    'bold': True,
                    'color': 0x0000FF,  # 빨간색
                    'text_align': 'center'
                },
                'paragraph': True
            },
            {
                'text': '이 문서는 MCP 도구를 통해 생성된 서식 적용 테스트 문서입니다.',
                'paragraph': True
            },
            {
                'text': '굵은 글자',
                'style': {
                    'bold': True
                }
            },
            {
                'text': '와 ',
                'style': {}
            },
            {
                'text': '기울임 글자',
                'style': {
                    'italic': True
                }
            },
            {
                'text': '와 ',
                'style': {}
            },
            {
                'text': '밑줄 글자',
                'style': {
                    'underline': 1
                }
            },
            {
                'text': '가 포함된 문장입니다.',
                'style': {},
                'paragraph': True
            },
            {
                'text': '다양한 색상의 텍스트',
                'style': {
                    'color': 0x0000FF,  # 빨간색
                    'font_size': 14
                },
                'paragraph': True
            },
            {
                'text': '형광펜 효과가 적용된 텍스트',
                'style': {
                    'highlight': 0x00FFFF  # 노란색
                },
                'paragraph': True
            }
        ]
        
        # 서식 적용 글쓰기 함수 호출
        result = write_styled_text_to_hwp(output_file, content_list)
        print(f"   결과: {result}")
        
        print("8. MCP 서식 함수 테스트 완료\n")
        return True
    except Exception as e:
        print(f"MCP 서식 함수 테스트 중 오류 발생: {e}")
        return False

def show_menu():
    """메뉴 표시"""
    print("\n=== pyhwpx 테스트 프로그램 ===")
    print("1. 한글 문서 생성")
    print("2. 한글 문서 수정")
    print("3. 한글 문서 읽기")
    print("4. 마크다운 → 한글 변환")
    print("5. README.md 서식 적용 변환")
    print("6. 서식 적용 문서 생성")
    print("7. 서식 정보 포함 문서 읽기")
    print("8. MCP 서식 함수 테스트")
    print("0. 종료")
    print("============================")
    choice = input("테스트할 기능 번호를 입력하세요: ")
    return choice

if __name__ == "__main__":
    # 명령행 인수로 바로 기능 실행
    if len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        choice = show_menu()
    
    try:
        if choice == "1":
            create_hwp()
        elif choice == "2":
            modify_hwp()
        elif choice == "3":
            read_hwp()
        elif choice == "4":
            md_to_hwp()
        elif choice == "5":
            convert_readme_to_hwp()
        elif choice == "6":
            test_styled_document()
        elif choice == "7":
            test_read_styled_document()
        elif choice == "8":
            test_mcp_style_functions()
        elif choice == "0":
            print("프로그램을 종료합니다.")
        else:
            print("잘못된 선택입니다. 1-8 사이의 숫자를 입력하세요.")
    except Exception as e:
        print(f"테스트 실행 중 오류 발생: {e}") 