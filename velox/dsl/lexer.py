"""
Velox Proxima (VP) — Lexer
Layer 1: Syntax Layer

Tokenizes VP source code into a stream of tokens.
"""

import re
from dataclasses import dataclass
from typing import List, Iterator
from enum import Enum, auto


class TokenType(Enum):
    # Keywords
    LAYER      = auto()
    TRAIN      = auto()
    ON         = auto()
    OPTIMIZER  = auto()
    EPOCHS     = auto()
    BATCH_SIZE = auto()
    LOSS       = auto()
    DROPOUT    = auto()
    SAVE       = auto()
    PLOT       = auto()
    EVAL       = auto()
    ALL        = auto()
    LIVE       = auto()
    ATTENTION  = auto()
    MAXPOOL2D  = auto()




    # Literals
    INTEGER    = auto()
    FLOAT      = auto()
    IDENTIFIER = auto()
    FILEPATH   = auto()   # e.g. model.pt, weights/my_model.pt

    # Symbols
    LPAREN     = auto()
    RPAREN     = auto()
    EQUALS     = auto()
    INFER      = auto()   # ?
    SLASH      = auto()
    COMMA      = auto()


    # Structural
    NEWLINE    = auto()
    EOF        = auto()
    COMMENT    = auto()


KEYWORDS = {
    "layer":      TokenType.LAYER,
    "train":      TokenType.TRAIN,
    "on":         TokenType.ON,
    "optimizer":  TokenType.OPTIMIZER,
    "epochs":     TokenType.EPOCHS,
    "batch_size": TokenType.BATCH_SIZE,
    "loss":       TokenType.LOSS,
    "dropout":    TokenType.DROPOUT,
    "save":       TokenType.SAVE,
    "plot":       TokenType.PLOT,
    "eval":       TokenType.EVAL,
    "all":        TokenType.ALL,
    "live":       TokenType.LIVE,
    "attention":  TokenType.ATTENTION,
    "maxpool2d":  TokenType.MAXPOOL2D,
    "maxpool":    TokenType.MAXPOOL2D,
}



# Order matters — longer/more-specific patterns first
TOKEN_PATTERNS = [
    (r"#[^\n]*",                                        TokenType.COMMENT),
    (r"\?",                                             TokenType.INFER),
    (r"\(",                                             TokenType.LPAREN),
    (r"\)",                                             TokenType.RPAREN),
    (r"=",                                              TokenType.EQUALS),
    (r",",                                              TokenType.COMMA),

    (r"\d+\.\d+",                                       TokenType.FLOAT),
    (r"\d+",                                            TokenType.INTEGER),
    # File paths: word chars + slashes + dots (e.g. model.pt, weights/my.pt)
    (r"[a-zA-Z_][a-zA-Z0-9_/\\.]*\.[a-zA-Z0-9]+",    TokenType.FILEPATH),
    (r"[a-zA-Z_][a-zA-Z0-9_]*",                        TokenType.IDENTIFIER),
    (r"\n",                                             TokenType.NEWLINE),
    (r"[ \t\r]+",                                       None),              # whitespace — skip
]

COMPILED = [(re.compile(pat), tt) for pat, tt in TOKEN_PATTERNS]


@dataclass
class Token:
    type: TokenType
    value: str
    line: int

    def __repr__(self):
        return f"Token({self.type.name}, {self.value!r}, line={self.line})"


class LexerError(Exception):
    def __init__(self, msg: str, line: int):
        super().__init__(f"[Lexer] Line {line}: {msg}")
        self.line = line


class Lexer:
    """Tokenizes VP source code."""

    def __init__(self, source: str):
        self.source = source
        self.pos = 0
        self.line = 1

    def tokenize(self) -> List[Token]:
        tokens: List[Token] = []
        while self.pos < len(self.source):
            matched = False
            for pattern, token_type in COMPILED:
                m = pattern.match(self.source, self.pos)
                if m:
                    text = m.group(0)
                    if token_type is not None:              # not whitespace
                        if token_type == TokenType.COMMENT:
                            pass                            # silently skip
                        elif token_type == TokenType.IDENTIFIER:
                            kw = KEYWORDS.get(text)
                            tok = Token(kw or TokenType.IDENTIFIER, text, self.line)
                            tokens.append(tok)
                        elif token_type == TokenType.NEWLINE:
                            tokens.append(Token(TokenType.NEWLINE, "\\n", self.line))
                            self.line += 1
                        else:
                            tokens.append(Token(token_type, text, self.line))
                    self.pos = m.end()
                    matched = True
                    break
            if not matched:
                raise LexerError(
                    f"Unexpected character: {self.source[self.pos]!r}",
                    self.line,
                )
        tokens.append(Token(TokenType.EOF, "", self.line))
        return tokens
