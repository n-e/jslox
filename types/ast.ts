import type { Token } from "../scanner.ts";

export type Expr = Unary | Literal | Binary | Grouping;
interface Binary {
  type: "binary";
  left: Expr;
  operator: Token;
  right: Expr;
}

interface Unary {
  type: "unary";
  operator: Token; // -, !
  right: Expr;
}

interface Grouping {
  type: "grouping";
  expression: Expr;
}

interface Literal {
  type: "literal";
  value:
    | { type: "string"; value: string }
    | { type: "number"; value: number }
    | { type: "boolean"; value: boolean }
    | { type: "nil" };
}

export type ExprVisitor<R> = {
  [K in Expr["type"]]: (expr: Extract<Expr, { type: K }>) => R;
};

export const visitableExpr = <T extends Expr>(expr: T) => ({
  ...expr,
  accept: <R>(visitor: ExprVisitor<R>): R => visitor[expr.type](expr as any),
});

export const visit = <T extends Expr, R>(
  visitor: ExprVisitor<R>,
  expr: T
): R => {
  return visitor[expr.type](expr as any);
};
