from pyhwpx import Hwp
import os
import tempfile
import json

class HwpReader:
    """아래아한글 문서를 읽기 위한 클래스"""
    
    def __init__(self):
        """HwpReader 초기화"""
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
    
    def read_hwp(self, file_path):
        """한글 문서 내용 읽기"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
        
        hwp = self.open()
        
        try:
            # 문서 열기
            hwp.open_document(file_path, open_flag="noconfirm")
            
            # 문서 내용 가져오기
            content = hwp.get_text()
            return content
        except Exception as e:
            raise Exception(f"한글 문서 읽기 오류: {str(e)}")
        finally:
            self.close()
    
    def read_hwp_with_style(self, file_path):
        """서식 정보를 포함하여 한글 문서 읽기"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
        
        hwp = self.open()
        
        try:
            # 문서 열기
            hwp.open_document(file_path, open_flag="noconfirm")
            
            # 문단 수 확인
            para_count = 0
            
            # 문서의 처음으로 이동
            hwp.HAction.Run("MoveDocBegin")
            
            contents = []
            
            # 문서 끝까지 각 문단을 순회하며 내용과 서식 정보 수집
            while True:
                # 현재 문단의 텍스트 가져오기
                hwp.HAction.Run("Select")
                current_text = hwp.get_selected_text()
                
                if current_text:
                    # 현재 문단의 서식 정보 수집
                    try:
                        hwp.HAction.GetDefault("CharShape", hwp.HParameterSet.HCharShape.HSet)
                        hwp.HAction.Execute("CharShape", hwp.HParameterSet.HCharShape.HSet)
                        
                        # 기본 서식 정보
                        style_info = {
                            "bold": bool(hwp.HParameterSet.HCharShape.Bold),
                            "italic": bool(hwp.HParameterSet.HCharShape.Italic),
                            "underline": hwp.HParameterSet.HCharShape.UnderlineType,
                            "size": hwp.HParameterSet.HCharShape.Height / 100,  # pt 단위로 변환
                            "color": hwp.HParameterSet.HCharShape.TextColor,
                            "font": hwp.HParameterSet.HCharShape.FaceNameHangul
                        }
                        
                        contents.append({
                            "text": current_text,
                            "style": style_info
                        })
                    except Exception as style_e:
                        # 서식 정보를 가져올 수 없는 경우 기본 텍스트만 추가
                        contents.append({
                            "text": current_text,
                            "style": {}
                        })
                
                # 다음 문단으로 이동 시도
                hwp.HAction.Run("MoveDown")
                
                # 문서의 끝인지 확인
                if hwp.is_endoffile():
                    break
                
                para_count += 1
                # 안전을 위한 최대 문단 수 제한
                if para_count > 1000:
                    break
            
            # 결과 반환 (JSON 형태로 직렬화 가능하도록 처리)
            return {
                "content": contents,
                "paragraph_count": para_count + 1
            }
        except Exception as e:
            raise Exception(f"한글 문서 서식 정보 읽기 오류: {str(e)}")
        finally:
            self.close()
    
    def get_hwp_text_by_section(self, file_path):
        """섹션별로 한글 문서 내용 읽기"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
        
        hwp = self.open()
        
        try:
            # 문서 열기
            hwp.open_document(file_path, open_flag="noconfirm")
            
            # 섹션 수 확인
            section_count = hwp.get_section_count()
            sections = []
            
            # 각 섹션의 내용 수집
            for i in range(section_count):
                hwp.move_to_section(i)
                sections.append(hwp.get_text())
            
            return sections
        except Exception as e:
            raise Exception(f"한글 문서 섹션별 읽기 오류: {str(e)}")
        finally:
            self.close()
    
    def extract_tables(self, file_path):
        """한글 문서에서 표 추출"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
        
        hwp = self.open()
        
        try:
            # 문서 열기
            hwp.open_document(file_path, open_flag="noconfirm")
            
            # 표 개수 확인 및 추출
            field_list = hwp.get_field_list("TableControl")
            tables = []
            
            for field in field_list:
                hwp.set_pos_by_set(field["item_id"])
                table_info = {}
                table_info["rows"] = hwp.get_table_row_count()
                table_info["cols"] = hwp.get_table_col_count()
                
                # 표 내용 추출
                table_data = []
                for row in range(table_info["rows"]):
                    row_data = []
                    for col in range(table_info["cols"]):
                        text = hwp.get_table_cell_text(row, col)
                        row_data.append(text)
                    table_data.append(row_data)
                
                table_info["data"] = table_data
                tables.append(table_info)
            
            return tables
        except Exception as e:
            raise Exception(f"한글 문서 표 추출 오류: {str(e)}")
        finally:
            self.close()
    
    def convert_to_text(self, file_path, output_path=None):
        """한글 문서를 텍스트 파일로 변환"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
        
        # 출력 경로가 지정되지 않은 경우 임시 파일 사용
        if output_path is None:
            with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as temp:
                output_path = temp.name
        
        hwp = self.open()
        
        try:
            # 문서 열기
            hwp.open_document(file_path, open_flag="noconfirm")
            
            # 텍스트 파일로 저장
            hwp.save_as(output_path, "TEXT")
            
            # 변환된 파일 읽기
            with open(output_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
            
            # 임시 파일인 경우 삭제
            if output_path.startswith(tempfile.gettempdir()):
                os.remove(output_path)
            
            return text_content
        except Exception as e:
            raise Exception(f"한글 문서 텍스트 변환 오류: {str(e)}")
        finally:
            self.close()

# MCP 서버에서 사용할 함수들
def read_hwp_content(file_path):
    """한글 문서의 내용을 읽어서 반환"""
    reader = HwpReader()
    return reader.read_hwp(file_path)

def read_hwp_with_style(file_path):
    """서식 정보를 포함하여 한글 문서의 내용을 읽어서 반환"""
    reader = HwpReader()
    return reader.read_hwp_with_style(file_path)

def read_hwp_by_section(file_path):
    """한글 문서의 내용을 섹션별로 읽어서 반환"""
    reader = HwpReader()
    return reader.get_hwp_text_by_section(file_path)

def extract_hwp_tables(file_path):
    """한글 문서에서 표를 추출하여 반환"""
    reader = HwpReader()
    return reader.extract_tables(file_path)

def convert_hwp_to_text(file_path, output_path=None):
    """한글 문서를 텍스트로, 변환하여 반환"""
    reader = HwpReader()
    return reader.convert_to_text(file_path, output_path) 