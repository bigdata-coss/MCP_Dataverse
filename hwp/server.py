from mcp.server.fastmcp import Context, FastMCP

# Create a named server
mcp = FastMCP("hwp-mcp", dependencies=["pyhwpx"])


@mcp.tool()
def format_message(template: str, **kwargs) -> str:
    """주어진 템플릿에 값을 채워 메시지를 생성합니다"""
    try:
        return template.format(**kwargs)
    except KeyError as e:
        raise ValueError(f"템플릿에 필요한 키가 없습니다: {e}")
    except Exception as e:
        raise ValueError(f"메시지 형식 지정 오류: {e}")


@mcp.tool()
def md2hwp(markdown_content: str = None, markdown_file: str = None, output_file: str = None) -> str:
    """마크다운 텍스트나 파일을 한글 문서로 변환합니다"""
    from tools.md2hwp import convert_md_to_hwp, convert_md_file_to_hwp
    
    if markdown_content:
        return convert_md_to_hwp(markdown_content, output_file)
    elif markdown_file:
        return convert_md_file_to_hwp(markdown_file, output_file)
    else:
        raise ValueError("마크다운 내용이나 파일 중 하나는 제공해야 합니다")


@mcp.tool()
def hwp_write(file_path: str, content: str = None, template_file: str = None, data: dict = None, style: dict = None, content_list: list = None) -> str:
    """한글 문서에 내용을 작성하거나 템플릿에 데이터를 채웁니다"""
    from tools.hwp_write import write_text_to_hwp, fill_template_with_data, write_styled_text_to_hwp
    
    if content:
        return write_text_to_hwp(file_path, content, style)
    elif template_file and data:
        style_dict = style if style else None
        return fill_template_with_data(template_file, file_path, data, style_dict)
    elif content_list:
        return write_styled_text_to_hwp(file_path, content_list)
    else:
        raise ValueError("내용, 템플릿+데이터, 또는 스타일 콘텐츠 리스트 중 하나는 제공해야 합니다")


@mcp.tool()
def hwp_read(file_path: str, by_section: bool = False, extract_tables: bool = False, with_style: bool = False) -> str:
    """한글 문서의 내용을 읽거나 표를 추출합니다"""
    from tools.hwp_read import read_hwp_content, read_hwp_by_section, extract_hwp_tables, read_hwp_with_style
    
    if not file_path:
        raise ValueError("파일 경로는 필수입니다")
    
    if extract_tables:
        return extract_hwp_tables(file_path)
    elif by_section:
        return read_hwp_by_section(file_path)
    elif with_style:
        return read_hwp_with_style(file_path)
    else:
        return read_hwp_content(file_path)


if __name__ == "__main__":
    mcp.run()