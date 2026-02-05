
import re

def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Remove strings
    content = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', content)
    content = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", content)
    # Remove backtick strings (simplified)
    content = re.sub(r'`[^`]*`', '``', content)

    # Remove comments
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

    stack = []
    lines = content.split('\n')

    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '{[(':
                stack.append((char, i + 1, j + 1))
            elif char in '}])':
                if not stack:
                    print(f"Error: Unexpected closing '{char}' at line {i+1}, col {j+1}")
                    return
                last, last_line, last_col = stack.pop()
                expected = {'{': '}', '[': ']', '(': ')'}[last]
                if char != expected:
                    print(f"Error: Mismatched '{char}' at line {i+1}, col {j+1}. Expected '{expected}' (opened at {last_line}:{last_col})")
                    return

    if stack:
        last, last_line, last_col = stack[-1]
        print(f"Error: Unclosed '{last}' at line {last_line}, col {last_col}")
    else:
        print("No balance errors found.")

check_balance('src/app/(mentee)/mypage/page.tsx')
