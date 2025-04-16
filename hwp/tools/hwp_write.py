from pyhwpx import Hwp
import os
import datetime

class HwpWriter:
    """아래아한글 문서를 생성하고 수정하기 위한 클래스"""
    
    def __init__(self):
        """HwpWriter 초기화"""
        self.hwp = None
    
    def open(self):
        """한글 애플리케이션 실행"""
        if self.hwp is None:
            self.hwp = Hwp(visible=False)
        return self.hwp
    
    def close(self):
        """한글 애플리케이션 종료"""
        if self.hwp:
            self.hwp.quit()
            self.hwp = None
    
    def create_new_document(self, template=None):
        """새 문서 생성"""
        hwp = self.open()
        
        try:
            if template and os.path.exists(template):
                hwp.open_document(template)
            else:
                # HAction을 사용하여 새 문서 생성
                hwp.HAction.Execute("FileNew", "")
            return True
        except Exception as e:
            raise Exception(f"새 문서 생성 오류: {str(e)}")
    
    def save_document(self, file_path):
        """문서 저장"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            directory = os.path.dirname(file_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory)
            
            self.hwp.save_as(file_path)
            return True
        except Exception as e:
            raise Exception(f"문서 저장 오류: {str(e)}")
    
    def insert_text(self, text):
        """텍스트 삽입"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.insert_text(text)
            return True
        except Exception as e:
            raise Exception(f"텍스트 삽입 오류: {str(e)}")
    
    def insert_paragraph(self, text):
        """단락 삽입"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.insert_text(text)
            self.hwp.insert_paragraph()
            return True
        except Exception as e:
            raise Exception(f"단락 삽입 오류: {str(e)}")
    
    def replace_text(self, find_text, replace_text, replace_all=True):
        """텍스트 찾아 바꾸기"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            return self.hwp.find_replace(find_text, replace_text, replace_all)
        except Exception as e:
            raise Exception(f"텍스트 찾아 바꾸기 오류: {str(e)}")
    
    def insert_table(self, rows, cols, data=None):
        """표 삽입"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.create_table(rows, cols)
            
            # 데이터가 있으면 표에 채우기
            if data:
                for row_idx, row_data in enumerate(data):
                    if row_idx >= rows:
                        break
                    for col_idx, cell_data in enumerate(row_data):
                        if col_idx >= cols:
                            break
                        self.hwp.set_table_cell_text(row_idx, col_idx, str(cell_data))
            
            return True
        except Exception as e:
            raise Exception(f"표 삽입 오류: {str(e)}")
    
    def insert_image(self, image_path, width=None, height=None):
        """이미지 삽입"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_path}")
        
        try:
            # 이미지 삽입
            self.hwp.insert_picture(image_path, width=width, height=height)
            return True
        except Exception as e:
            raise Exception(f"이미지 삽입 오류: {str(e)}")
    
    def set_font(self, font_name=None, font_size=None, bold=None, italic=None, underline=None):
        """폰트 설정"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            if font_name:
                self.hwp.set_font_name(font_name)
            if font_size:
                self.hwp.set_font_size(font_size)
            if bold is not None:
                self.hwp.set_font_bold(bold)
            if italic is not None:
                self.hwp.set_font_italic(italic)
            if underline is not None:
                self.hwp.set_font_underline(underline)
            return True
        except Exception as e:
            raise Exception(f"폰트 설정 오류: {str(e)}")
    
    def set_text_style(self, text, style=None):
        """
        텍스트를 삽입하면서 서식을 함께 적용합니다.
        
        Args:
            text (str): 삽입할 텍스트
            style (dict): 적용할 서식 정보의 딕셔너리
                {
                    'font_name': 글꼴 이름,
                    'font_size': 글꼴 크기,
                    'bold': 굵게 (True/False),
                    'italic': 기울임 (True/False),
                    'underline': 밑줄 (0-없음, 1-실선, 2-점선, 3-쇄선 등),
                    'color': 텍스트 색상 (0xRRGGBB 형식의 정수),
                    'highlight': 형광펜 색상 (0xRRGGBB 형식의 정수),
                    'spacing': 자간 (%), 
                    'text_align': 정렬 ('left', 'center', 'right', 'justify')
                }
        
        Returns:
            bool: 성공 시 True
        """
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        if not style:
            style = {}
        
        try:
            # 텍스트 삽입
            self.hwp.insert_text(text)
            
            # 삽입된 텍스트 선택
            self.hwp.HAction.Run("Select")
            
            # 문자 서식 설정
            self.hwp.HAction.GetDefault("CharShape", self.hwp.HParameterSet.HCharShape.HSet)
            
            # 글꼴 이름 설정
            if 'font_name' in style:
                self.hwp.HParameterSet.HCharShape.FaceNameHangul = style['font_name']
                self.hwp.HParameterSet.HCharShape.FaceNameLatin = style['font_name']
            
            # 글꼴 크기 설정 (포인트 * 100)
            if 'font_size' in style:
                self.hwp.HParameterSet.HCharShape.Height = style['font_size'] * 100
            
            # 굵게 설정
            if 'bold' in style:
                self.hwp.HParameterSet.HCharShape.Bold = 1 if style['bold'] else 0
            
            # 기울임 설정
            if 'italic' in style:
                self.hwp.HParameterSet.HCharShape.Italic = 1 if style['italic'] else 0
            
            # 밑줄 설정
            if 'underline' in style:
                self.hwp.HParameterSet.HCharShape.UnderlineType = style['underline']
            
            # 색상 설정
            if 'color' in style:
                self.hwp.HParameterSet.HCharShape.TextColor = style['color']
            
            # 음영색 설정
            if 'highlight' in style:
                self.hwp.HParameterSet.HCharShape.ShadeColor = style['highlight']
                self.hwp.HParameterSet.HCharShape.ShadeStyle = 1  # 음영 스타일 (1: 도트)
            
            # 자간 설정
            if 'spacing' in style:
                self.hwp.HParameterSet.HCharShape.CharSpacing = style['spacing']
            
            # 서식 적용
            self.hwp.HAction.Execute("CharShape", self.hwp.HParameterSet.HCharShape.HSet)
            
            # 텍스트 정렬 설정
            if 'text_align' in style:
                align_cmd = {
                    'left': 'ParagraphShapeAlignLeft',
                    'center': 'ParagraphShapeAlignCenter',
                    'right': 'ParagraphShapeAlignRight',
                    'justify': 'ParagraphShapeAlignJustify'
                }.get(style['text_align'].lower(), 'ParagraphShapeAlignLeft')
                
                self.hwp.HAction.GetDefault(align_cmd, self.hwp.HParameterSet.HParaShape.HSet)
                self.hwp.HAction.Execute(align_cmd, self.hwp.HParameterSet.HParaShape.HSet)
            
            return True
        except Exception as e:
            raise Exception(f"텍스트 스타일 적용 오류: {str(e)}")
    
    def insert_styled_paragraph(self, text, style=None):
        """스타일이 적용된 단락을 삽입합니다."""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            result = self.set_text_style(text, style)
            self.hwp.insert_paragraph()
            return result
        except Exception as e:
            raise Exception(f"스타일 단락 삽입 오류: {str(e)}")
    
    def set_text_highlight(self, color=0xFFFF00):  # 기본값은 노란색(0xFFFF00)
        """선택된 텍스트에 형광펜(강조색) 적용"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.HAction.GetDefault("CharShapeShadeColor", self.hwp.HParameterSet.HCharShape.HSet)
            self.hwp.HParameterSet.HCharShape.ShadeColor = color
            self.hwp.HParameterSet.HCharShape.ShadeStyle = 1  # 음영 스타일 (1: 도트)
            self.hwp.HAction.Execute("CharShapeShadeColor", self.hwp.HParameterSet.HCharShape.HSet)
            return True
        except Exception as e:
            raise Exception(f"텍스트 형광펜 적용 오류: {str(e)}")
    
    def set_text_color(self, color=0x000000):  # 기본값은 검은색(0x000000)
        """선택된 텍스트의 색상 변경"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.HAction.GetDefault("CharShapeTextColor", self.hwp.HParameterSet.HCharShape.HSet)
            self.hwp.HParameterSet.HCharShape.TextColor = color
            self.hwp.HAction.Execute("CharShapeTextColor", self.hwp.HParameterSet.HCharShape.HSet)
            return True
        except Exception as e:
            raise Exception(f"텍스트 색상 변경 오류: {str(e)}")
    
    def insert_bookmark(self, bookmark_name):
        """북마크 삽입"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            self.hwp.insert_bookmark(bookmark_name)
            return True
        except Exception as e:
            raise Exception(f"북마크 삽입 오류: {str(e)}")
    
    def move_to_bookmark(self, bookmark_name):
        """북마크로 이동"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            return self.hwp.goto_bookmark(bookmark_name)
        except Exception as e:
            raise Exception(f"북마크로 이동 오류: {str(e)}")
    
    def fill_bookmark(self, bookmark_name, text):
        """북마크에 텍스트 채우기"""
        if not self.hwp:
            raise Exception("한글이 실행되지 않았습니다.")
        
        try:
            if self.move_to_bookmark(bookmark_name):
                self.hwp.insert_text(text)
                return True
            return False
        except Exception as e:
            raise Exception(f"북마크 채우기 오류: {str(e)}")

# MCP 서버에서 사용할 함수들
def create_hwp_document(template=None):
    """새 한글 문서 생성"""
    writer = HwpWriter()
    writer.open()
    result = writer.create_new_document(template)
    return result

def save_hwp_document(file_path):
    """현재 한글 문서 저장"""
    writer = HwpWriter()
    writer.open()
    result = writer.save_document(file_path)
    writer.close()
    return result

def write_text_to_hwp(file_path, content, style=None):
    """텍스트를 한글 문서에 작성"""
    writer = HwpWriter()
    writer.open()
    writer.create_new_document()
    
    # 스타일이 제공된 경우 스타일 적용
    if style:
        writer.set_text_style(content, style)
    else:
        writer.insert_text(content)
    
    if file_path:
        writer.save_document(file_path)
        writer.close()
        return f"문서가 {file_path}에 저장되었습니다."
    else:
        writer.close()
        return "텍스트가 문서에 삽입되었습니다."

def write_styled_text_to_hwp(file_path, content_list):
    """
    스타일이 지정된 텍스트를 한글 문서에 작성
    
    Args:
        file_path (str): 저장할 파일 경로
        content_list (list): 텍스트와 스타일 정보를 담은 리스트
            [
                {'text': '텍스트1', 'style': {'font_name': '함초롬바탕', 'font_size': 12, 'bold': True}},
                {'text': '텍스트2', 'style': {'italic': True, 'underline': 1}},
                ...
            ]
    """
    writer = HwpWriter()
    writer.open()
    writer.create_new_document()
    
    for item in content_list:
        text = item.get('text', '')
        style = item.get('style', {})
        
        # 단락 구분이 필요한 경우
        if item.get('paragraph', False):
            writer.insert_styled_paragraph(text, style)
        else:
            writer.set_text_style(text, style)
    
    if file_path:
        writer.save_document(file_path)
        writer.close()
        return f"스타일이 적용된 문서가 {file_path}에 저장되었습니다."
    else:
        writer.close()
        return "스타일이 적용된 텍스트가 문서에 삽입되었습니다."

def create_table_in_hwp(rows, cols, data=None, file_path=None):
    """한글 문서에 표 생성"""
    writer = HwpWriter()
    writer.open()
    writer.create_new_document()
    writer.insert_table(rows, cols, data)
    
    if file_path:
        writer.save_document(file_path)
        writer.close()
        return f"표가 포함된 문서가 {file_path}에 저장되었습니다."
    else:
        writer.close()
        return "표가 문서에 삽입되었습니다."

def replace_text_in_hwp(file_path, find_text, replace_text, output_path=None):
    """한글 문서에서 텍스트 찾아 바꾸기"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
    
    writer = HwpWriter()
    writer.open()
    
    try:
        writer.hwp.open_document(file_path, open_flag="noconfirm")
        count = writer.replace_text(find_text, replace_text)
        
        # 결과를 새 파일로 저장하거나 원본 파일 덮어쓰기
        if output_path:
            writer.save_document(output_path)
        else:
            writer.save_document(file_path)
        
        writer.close()
        return f"{count}개의 항목이 변경되었습니다."
    except Exception as e:
        writer.close()
        raise Exception(f"텍스트 찾아 바꾸기 오류: {str(e)}")

def fill_template_with_data(template_path, output_path, data_dict, style_dict=None):
    """템플릿 문서에 데이터 채우기 (스타일 지정 가능)"""
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"템플릿 파일을 찾을 수 없습니다: {template_path}")
    
    writer = HwpWriter()
    writer.open()
    
    try:
        # 템플릿 열기
        writer.hwp.open_document(template_path, open_flag="noconfirm")
        
        # 북마크에 데이터 채우기
        for key, value in data_dict.items():
            # 스타일 정보가 있으면 함께 적용
            if style_dict and key in style_dict:
                if writer.move_to_bookmark(key):
                    writer.set_text_style(str(value), style_dict[key])
            else:
                writer.fill_bookmark(key, str(value))
        
        # 저장
        writer.save_document(output_path)
        writer.close()
        return f"템플릿이 {output_path}에 저장되었습니다."
    except Exception as e:
        writer.close()
        raise Exception(f"템플릿 채우기 오류: {str(e)}") 