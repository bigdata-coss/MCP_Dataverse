from mcp.server.fastmcp import Context, FastMCP
import datetime
import random
import string

# Create a named server
mcp = FastMCP("hwp-mcp", dependencies=["pyhwp"])

@mcp.resource("echo://{message}")
def echo_resource(message: str) -> str:
    """Echo a message as a resource"""
    return f"Resource echo: {message}"


@mcp.tool()
def echo_tool(message: str) -> str:
    """Echo a message as a tool"""
    return f"Tool echo: {message}"


@mcp.prompt()
def echo_prompt(message: str) -> str:
    """Create an echo prompt"""
    return f"Please process this message: {message}"


@mcp.tool()
def add(a: float, b: float) -> float:
    """두 숫자를 더합니다"""
    return a + b


@mcp.tool()
def subtract(a: float, b: float) -> float:
    """첫 번째 숫자에서 두 번째 숫자를 뺍니다"""
    return a - b


@mcp.tool()
def multiply(a: float, b: float) -> float:
    """두 숫자를 곱합니다"""
    return a * b


@mcp.tool()
def divide(a: float, b: float) -> float:
    """첫 번째 숫자를 두 번째 숫자로 나눕니다"""
    if b == 0:
        raise ValueError("0으로 나눌 수 없습니다")
    return a / b


@mcp.tool()
def integer_divide(a: int, b: int) -> int:
    """첫 번째 정수를 두 번째 정수로 나눕니다 (정수 나눗셈)"""
    if b == 0:
        raise ValueError("0으로 나눌 수 없습니다")
    return a // b


@mcp.tool()
def modulo(a: int, b: int) -> int:
    """첫 번째 정수를 두 번째 정수로 나눈 나머지를 구합니다"""
    if b == 0:
        raise ValueError("0으로 나눌 수 없습니다")
    return a % b


@mcp.tool()
def power(base: float, exponent: float) -> float:
    """주어진 숫자의 거듭제곱을 계산합니다"""
    return base ** exponent


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
def string_upper(text: str) -> str:
    """문자열을 대문자로 변환합니다"""
    return text.upper()


@mcp.tool()
def string_lower(text: str) -> str:
    """문자열을 소문자로 변환합니다"""
    return text.lower()


@mcp.tool()
def string_split(text: str, delimiter: str = " ") -> list:
    """문자열을 구분자를 기준으로 나눕니다"""
    return text.split(delimiter)


@mcp.tool()
def string_join(parts: list, delimiter: str = " ") -> str:
    """문자열 리스트를 하나의 문자열로 합칩니다"""
    return delimiter.join(parts)


@mcp.tool()
def get_current_time() -> str:
    """현재 시간을 반환합니다"""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@mcp.tool()
def format_date(year: int, month: int, day: int, format_str: str = "%Y-%m-%d") -> str:
    """주어진 년, 월, 일을 지정된 형식의 날짜 문자열로 변환합니다"""
    try:
        date = datetime.date(year, month, day)
        return date.strftime(format_str)
    except ValueError as e:
        raise ValueError(f"잘못된 날짜 형식입니다: {e}")


@mcp.tool()
def days_between(start_date: str, end_date: str, date_format: str = "%Y-%m-%d") -> int:
    """두 날짜 사이의 일수를 계산합니다 (형식: YYYY-MM-DD)"""
    try:
        start = datetime.datetime.strptime(start_date, date_format).date()
        end = datetime.datetime.strptime(end_date, date_format).date()
        return (end - start).days
    except ValueError as e:
        raise ValueError(f"잘못된 날짜 형식입니다: {e}")


@mcp.tool()
def generate_random_string(length: int = 10, include_digits: bool = True, include_special: bool = False) -> str:
    """지정된 길이의 랜덤 문자열을 생성합니다"""
    if length <= 0:
        raise ValueError("길이는 양수여야 합니다")
    
    chars = string.ascii_letters
    if include_digits:
        chars += string.digits
    if include_special:
        chars += string.punctuation
    
    return ''.join(random.choice(chars) for _ in range(length))


if __name__ == "__main__":
    mcp.run()