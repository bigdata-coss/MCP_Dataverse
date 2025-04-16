from pyhwpx import Hwp
import os
import re
import markdown
from bs4 import BeautifulSoup
from .hwp_write import HwpWriter

class MarkdownToHwp:
    """마크다운을 한글 문서로 변환하는 클래스"""
    
    def __init__(self):
        """MarkdownToHwp 초기화"""
        self.writer = HwpWriter()
        self.hwp = None
    
    def open(self):
        """한글 애플리케이션 실행"""
        self.hwp = self.writer.open()
        return self.hwp
    
    def close(self):
        """한글 애플리케이션 종료"""
        self.writer.close()
        self.hwp = None
    
    def markdown_to_html(self, markdown_text):
        """마크다운을 HTML로 변환"""
        html = markdown.markdown(markdown_text, extensions=['tables', 'fenced_code'])
        return html
    
    def _set_heading_style(self, level):
        """제목 스타일 설정"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        # 제목 수준에 따른 폰트 크기 설정
        sizes = {1: 24, 2: 20, 3: 18, 4: 16, 5: 14, 6: 12}
        font_size = sizes.get(level, 12)
        
        try:
            self.hwp.set_font_size(font_size)
            self.hwp.set_font_bold(True)
            return True
        except Exception as e:
            raise Exception(f"제목 스타일 설정 오류: {str(e)}")
    
    def _set_normal_style(self):
        """일반 텍스트 스타일 설정"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.set_font_size(10)
            self.hwp.set_font_bold(False)
            self.hwp.set_font_italic(False)
            self.hwp.set_font_underline(False)
            return True
        except Exception as e:
            raise Exception(f"일반 텍스트 스타일 설정 오류: {str(e)}")
    
    def _add_heading(self, text, level):
        """제목 추가"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self._set_heading_style(level)
            self.hwp.insert_text(text)
            self.hwp.insert_paragraph()
            self._set_normal_style()
            return True
        except Exception as e:
            raise Exception(f"제목 추가 오류: {str(e)}")
    
    def _add_paragraph(self, text):
        """단락 추가"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self._set_normal_style()
            self.hwp.insert_text(text)
            self.hwp.insert_paragraph()
            return True
        except Exception as e:
            raise Exception(f"단락 추가 오류: {str(e)}")
    
    def _add_list_item(self, text, level=0):
        """목록 항목 추가"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            indent = "  " * level
            bullet = "• "
            self._set_normal_style()
            self.hwp.insert_text(f"{indent}{bullet}{text}")
            self.hwp.insert_paragraph()
            return True
        except Exception as e:
            raise Exception(f"목록 항목 추가 오류: {str(e)}")
    
    def _add_table(self, headers, rows):
        """표 추가"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            # 표 생성
            row_count = len(rows) + 1  # 헤더 포함
            col_count = len(headers)
            
            self.hwp.create_table(row_count, col_count)
            
            # 헤더 채우기
            for col, header in enumerate(headers):
                self.hwp.set_table_cell_text(0, col, header)
            
            # 데이터 채우기
            for row_idx, row_data in enumerate(rows):
                for col_idx, cell_data in enumerate(row_data):
                    if col_idx < col_count:
                        self.hwp.set_table_cell_text(row_idx + 1, col_idx, cell_data)
            
            self.hwp.insert_paragraph()
            return True
        except Exception as e:
            raise Exception(f"표 추가 오류: {str(e)}")
    
    def _add_code_block(self, code, language=None):
        """코드 블록 추가"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            # 코드 블록 스타일 설정
            self.hwp.set_font_name("Consolas")
            self.hwp.set_font_size(9)
            
            # 코드 블록 테두리 설정
            self.hwp.insert_text(f"```{language or ''}\n")
            self.hwp.insert_text(code)
            self.hwp.insert_text("\n```")
            self.hwp.insert_paragraph()
            
            # 일반 스타일로 복원
            self._set_normal_style()
            return True
        except Exception as e:
            raise Exception(f"코드 블록 추가 오류: {str(e)}")
    
    def _process_html_to_hwp(self, soup):
        """HTML을 한글 문서로 변환 처리"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        # 최상위 요소들 순회
        for element in soup.children:
            if element.name is None:
                continue
                
            if element.name.startswith('h') and len(element.name) == 2:
                level = int(element.name[1])
                self._add_heading(element.get_text(), level)
                
            elif element.name == 'p':
                self._add_paragraph(element.get_text())
                
            elif element.name == 'ul':
                for li_idx, li in enumerate(element.find_all('li', recursive=False)):
                    self._add_list_item(li.get_text(), 0)
                    
            elif element.name == 'ol':
                for li_idx, li in enumerate(element.find_all('li', recursive=False)):
                    self._add_list_item(f"{li_idx+1}. {li.get_text()}", 0)
                    
            elif element.name == 'table':
                # 테이블 헤더 추출
                headers = []
                for th in element.find('thead').find_all('th'):
                    headers.append(th.get_text())
                
                # 테이블 데이터 추출
                rows = []
                for tr in element.find('tbody').find_all('tr'):
                    row = []
                    for td in tr.find_all('td'):
                        row.append(td.get_text())
                    rows.append(row)
                
                self._add_table(headers, rows)
                
            elif element.name == 'pre' and element.find('code'):
                code = element.find('code').get_text()
                language = element.find('code').get('class', [''])[0].replace('language-', '')
                self._add_code_block(code, language)
                
            elif element.name == 'hr':
                self.hwp.insert_paragraph()
                self.hwp.insert_text('─' * 50)
                self.hwp.insert_paragraph()
                
            else:
                self._add_paragraph(element.get_text())
    
    def convert(self, markdown_text, output_path):
        """마크다운을 한글 문서로 변환"""
        self.open()
        self.writer.create_new_document()
        
        try:
            # 마크다운을 HTML로 변환
            html = self.markdown_to_html(markdown_text)
            soup = BeautifulSoup(html, 'html.parser')
            
            # HTML을 한글 문서로 변환
            self._process_html_to_hwp(soup)
            
            # 저장
            self.writer.save_document(output_path)
            self.close()
            return True
        except Exception as e:
            self.close()
            raise Exception(f"마크다운 변환 오류: {str(e)}")
    
    def convert_file(self, markdown_path, output_path):
        """마크다운 파일을 한글 문서로 변환"""
        if not os.path.exists(markdown_path):
            raise FileNotFoundError(f"마크다운 파일을 찾을 수 없습니다: {markdown_path}")
        
        try:
            with open(markdown_path, 'r', encoding='utf-8') as f:
                markdown_text = f.read()
            
            return self.convert(markdown_text, output_path)
        except Exception as e:
            raise Exception(f"마크다운 파일 변환 오류: {str(e)}")

# MCP 서버에서 사용할 함수들
def convert_md_to_hwp(markdown_text, output_path):
    """마크다운 텍스트를 한글 문서로 변환"""
    converter = MarkdownToHwp()
    return converter.convert(markdown_text, output_path)

def convert_md_file_to_hwp(markdown_path, output_path):
    """마크다운 파일을 한글 문서로 변환"""
    converter = MarkdownToHwp()
    return converter.convert_file(markdown_path, output_path) 