"""
Velox Proxima (VP) — Parser
Layer 1: Syntax Layer

Converts a token stream into a ModelNode AST.

Grammar (simplified):

    program     := statement* EOF
    statement   := layer_stmt
                 | train_stmt
                 | optimizer_stmt
                 | epochs_stmt
                 | batch_stmt
                 | loss_stmt
                 | save_stmt
                 | plot_stmt
                 | eval_stmt
                 | NEWLINE

    layer_stmt  := LAYER IDENTIFIER LPAREN param_list RPAREN NEWLINE?
    param_list  := (param (COMMA param)*)? | INFER
    param       := INTEGER | FLOAT | IDENTIFIER

    train_stmt  := TRAIN ON IDENTIFIER NEWLINE?
    optimizer_stmt := OPTIMIZER IDENTIFIER (IDENTIFIER EQUALS (INTEGER|FLOAT))* NEWLINE?
    epochs_stmt := EPOCHS INTEGER NEWLINE?
    batch_stmt  := BATCH_SIZE INTEGER NEWLINE?
    loss_stmt   := LOSS IDENTIFIER NEWLINE?
    save_stmt   := SAVE FILEPATH NEWLINE?
    plot_stmt   := PLOT (IDENTIFIER | ALL) (to FILEPATH)? NEWLINE?
    eval_stmt   := EVAL ON IDENTIFIER NEWLINE?
"""

from typing import List, Optional, Union
from .lexer import Token, TokenType, Lexer
from .ast_nodes import (
    ModelNode, LayerNode, TrainNode, OptimizerNode,
    EpochsNode, BatchSizeNode, LossNode,
    SaveNode, PlotNode, EvalNode,
)


class ParseError(Exception):
    def __init__(self, msg: str, line: int):
        super().__init__(f"[Parser] Line {line}: {msg}")
        self.line = line


class Parser:
    """Recursive-descent parser for the VP DSL."""

    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    def peek(self) -> Token:
        return self.tokens[self.pos]

    def advance(self) -> Token:
        tok = self.tokens[self.pos]
        if tok.type != TokenType.EOF:
            self.pos += 1
        return tok

    def expect(self, tt: TokenType) -> Token:
        tok = self.peek()
        if tok.type != tt:
            raise ParseError(
                f"Expected {tt.name}, got {tok.type.name} ({tok.value!r})",
                tok.line,
            )
        return self.advance()

    def skip_newlines(self):
        while self.peek().type == TokenType.NEWLINE:
            self.advance()

    def match(self, *types: TokenType) -> bool:
        return self.peek().type in types

    # ------------------------------------------------------------------ #
    # Entry point                                                          #
    # ------------------------------------------------------------------ #

    def parse(self) -> ModelNode:
        model = ModelNode()
        self.skip_newlines()
        while not self.match(TokenType.EOF):
            stmt = self._parse_statement()
            if stmt is None:
                continue
            if isinstance(stmt, LayerNode):
                model.layers.append(stmt)
            elif isinstance(stmt, TrainNode):
                model.train = stmt
            elif isinstance(stmt, OptimizerNode):
                model.optimizer = stmt
            elif isinstance(stmt, EpochsNode):
                model.epochs = stmt
            elif isinstance(stmt, BatchSizeNode):
                model.batch_size = stmt
            elif isinstance(stmt, LossNode):
                model.loss = stmt
            elif isinstance(stmt, SaveNode):
                model.save = stmt
            elif isinstance(stmt, PlotNode):
                model.plot = stmt
            elif isinstance(stmt, EvalNode):
                model.eval = stmt
            self.skip_newlines()
        return model

    # ------------------------------------------------------------------ #
    # Statement dispatch                                                   #
    # ------------------------------------------------------------------ #

    def _parse_statement(self):
        tok = self.peek()
        if tok.type == TokenType.NEWLINE:
            self.advance()
            return None
        elif tok.type == TokenType.LAYER:
            return self._parse_layer()
        elif tok.type == TokenType.TRAIN:
            return self._parse_train()
        elif tok.type == TokenType.OPTIMIZER:
            return self._parse_optimizer()
        elif tok.type == TokenType.EPOCHS:
            return self._parse_epochs()
        elif tok.type == TokenType.BATCH_SIZE:
            return self._parse_batch_size()
        elif tok.type == TokenType.LOSS:
            return self._parse_loss()
        elif tok.type == TokenType.SAVE:
            return self._parse_save()
        elif tok.type == TokenType.PLOT:
            return self._parse_plot()
        elif tok.type == TokenType.EVAL:
            return self._parse_eval()
        else:
            raise ParseError(
                f"Unexpected token {tok.type.name} ({tok.value!r})",
                tok.line,
            )

    # ------------------------------------------------------------------ #
    # Individual statement parsers                                         #
    # ------------------------------------------------------------------ #

    def _parse_layer(self) -> LayerNode:
        start = self.advance()          # consume 'layer'
        name_tok = self.expect(TokenType.IDENTIFIER)
        self.expect(TokenType.LPAREN)

        params: List[Union[int, float, str]] = []
        infer = False

        if self.match(TokenType.INFER):
            self.advance()
            infer = True
        elif not self.match(TokenType.RPAREN):
            params.append(self._parse_param())
            while not self.match(TokenType.RPAREN, TokenType.NEWLINE, TokenType.EOF):
                if self.match(TokenType.COMMA):
                    self.advance()
                params.append(self._parse_param())



        self.expect(TokenType.RPAREN)
        return LayerNode(
            layer_type=name_tok.value,
            params=params,
            infer=infer,
            line=start.line,
        )

    def _parse_param(self) -> Union[int, float, str]:
        tok = self.peek()
        if tok.type == TokenType.FLOAT:
            self.advance()
            return float(tok.value)
        elif tok.type == TokenType.INTEGER:
            self.advance()
            return int(tok.value)
        elif tok.type == TokenType.IDENTIFIER:
            self.advance()
            return tok.value
        else:
            raise ParseError(
                f"Expected parameter (number or identifier), got {tok.type.name}",
                tok.line,
            )

    def _parse_train(self) -> TrainNode:
        start = self.advance()          # consume 'train'
        self.expect(TokenType.ON)
        ds_tok = self.expect(TokenType.IDENTIFIER)
        return TrainNode(dataset=ds_tok.value, line=start.line)

    def _parse_optimizer(self) -> OptimizerNode:
        start = self.advance()          # consume 'optimizer'
        name_tok = self.expect(TokenType.IDENTIFIER)
        hparams = {}
        while self.match(TokenType.IDENTIFIER):
            key = self.advance().value
            self.expect(TokenType.EQUALS)
            val_tok = self.peek()
            if val_tok.type == TokenType.FLOAT:
                hparams[key] = float(self.advance().value)
            elif val_tok.type == TokenType.INTEGER:
                hparams[key] = int(self.advance().value)
            else:
                raise ParseError(
                    f"Expected numeric value for hyperparameter {key!r}",
                    val_tok.line,
                )
        return OptimizerNode(name=name_tok.value, hyperparams=hparams, line=start.line)

    def _parse_epochs(self) -> EpochsNode:
        start = self.advance()
        n_tok = self.expect(TokenType.INTEGER)
        return EpochsNode(count=int(n_tok.value), line=start.line)

    def _parse_batch_size(self) -> BatchSizeNode:
        start = self.advance()
        n_tok = self.expect(TokenType.INTEGER)
        return BatchSizeNode(size=int(n_tok.value), line=start.line)

    def _parse_loss(self) -> LossNode:
        start = self.advance()
        name_tok = self.expect(TokenType.IDENTIFIER)
        return LossNode(name=name_tok.value, line=start.line)

    def _parse_save(self) -> SaveNode:
        """save model.pt"""
        start = self.advance()      # consume 'save'
        tok = self.peek()
        if tok.type == TokenType.FILEPATH:
            path = self.advance().value
        elif tok.type == TokenType.IDENTIFIER:
            # bare name with no extension, e.g. 'save mymodel'
            path = self.advance().value + ".pt"
        else:
            raise ParseError(
                f"Expected file path after 'save', got {tok.type.name}",
                tok.line,
            )
        return SaveNode(path=path, line=start.line)

    def _parse_plot(self) -> PlotNode:
        """
        plot loss
        plot accuracy
        plot all
        plot loss to loss_curve.png
        """
        start = self.advance()      # consume 'plot'
        targets = []
        live = False
        tok = self.peek()
        
        if tok.type == TokenType.LIVE:
            self.advance()
            live = True
            targets = ["loss", "accuracy"]
        elif tok.type == TokenType.ALL:
            self.advance()
            targets = ["loss", "accuracy"]
        elif tok.type == TokenType.IDENTIFIER:
            targets = [self.advance().value.lower()]
        else:
            targets = ["loss", "accuracy"]

        # Optional: 'to <filepath>'
        save_path = None
        if self.match(TokenType.IDENTIFIER) and self.peek().value == "to":
            self.advance()   # consume 'to'
            fp = self.peek()
            if fp.type in (TokenType.FILEPATH, TokenType.IDENTIFIER):
                save_path = self.advance().value

        return PlotNode(targets=targets, save_path=save_path, live=live, line=start.line)


    def _parse_eval(self) -> EvalNode:
        """eval on test | eval on train"""
        start = self.advance()      # consume 'eval'
        self.expect(TokenType.ON)
        split_tok = self.expect(TokenType.IDENTIFIER)
        return EvalNode(split=split_tok.value, line=start.line)


# ------------------------------------------------------------------ #
# Convenience shortcut                                                 #
# ------------------------------------------------------------------ #

def parse(source: str) -> ModelNode:
    """Lex + parse VP source code, return ModelNode AST."""
    tokens = Lexer(source).tokenize()
    return Parser(tokens).parse()
