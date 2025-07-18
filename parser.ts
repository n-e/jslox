import assert from "node:assert";
import type { Token, TokenMeta } from "./scanner.ts";
import type { Expr } from "./types/ast.ts";

class UnexpectedTokenError extends Error {
  constructor(token: Token & TokenMeta) {
    super(`[${token.line}:${token.col}] Unexpected token ${token.type}`);
  }
}

export const parse = (tokens: (Token & TokenMeta)[]): Expr => {
  let position = 0;

  // TOKEN CONSUMPTION
  const advance = () => {
    return tokens.at(position++);
  };
  const peek = () => {
    return tokens.at(position);
  };
  const matchAny = (...types: Token["type"][]): Token | null => {
    const peeked = peek();
    const matched = peeked && types.includes(peeked.type);
    if (matched) {
      advance();
      return peeked;
    }
    return null;
  };
  const consume = (type: Token["type"], errMsg: string) => {
    const match = matchAny(type);
    if (match) return;
    else throw new UnexpectedTokenError(peek()!);
  };

  // RULES AND PRODUCTIONS

  const expression = () => equality();

  // builds functions of the type <- delegate ( (...opTypes) delegate )*
  const seqBuilder = (opTypes: Token["type"][], delegate: () => Expr) => {
    return () => {
      let expr = delegate();

      let tok: Token | null;
      while ((tok = matchAny(...opTypes))) {
        const right = delegate();
        expr = { type: "binary", operator: tok, left: expr, right };
      }
      return expr;
    };
  };

  const primary = (): Expr => {
    const tok = advance();
    assert(tok);

    switch (tok?.type) {
      case "LEFT_PAREN":
        const exp = expression();
        const rparen = advance();
        assert(rparen?.type === "RIGHT_PAREN");
        return { type: "grouping", expression: exp };
      case "STRING":
        return {
          type: "literal",
          value: { type: "string", value: tok.literal },
        };
      case "NUMBER":
        return {
          type: "literal",
          value: { type: "number", value: tok.literal },
        };
      case "TRUE":
        return {
          type: "literal",
          value: { type: "boolean", value: true },
        };
      case "FALSE":
        return {
          type: "literal",
          value: { type: "boolean", value: false },
        };
      case "NIL":
        return { type: "literal", value: { type: "nil" } };
      default:
        throw new UnexpectedTokenError(tok);
    }
  };
  // unary <- (! | -) unary | primary
  const unary = (): Expr => {
    const tok = matchAny("BANG", "MINUS");
    if (tok) {
      return { type: "unary", operator: tok, right: unary() };
    } else {
      return primary();
    }
  };
  const factor = seqBuilder(["STAR", "SLASH"], unary);
  const term = seqBuilder(["PLUS", "MINUS"], factor);
  const comparison = seqBuilder(["LT", "LTE", "GT", "GTE"], term);
  const equality = seqBuilder(["EQUAL_EQUAL", "BANG_EQUAL"], comparison);

  return expression();
};
