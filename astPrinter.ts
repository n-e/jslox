import { visit, type Expr, type ExprVisitor } from "./types/ast.ts";

const astPrinter: ExprVisitor<string> = {
  literal(expr) {
    const v = expr.value;
    if (v.type === "nil") return "nil";
    return v.value.toString();
  },
  unary(expr) {
    return `(${expr.operator.type} ${printAst(expr.right)})`;
  },
  binary(expr) {
    return `(${printAst(expr.left)} ${expr.operator.type} ${printAst(
      expr.right
    )})`;
  },
  grouping(expr) {
    return `(${printAst(expr.expression)})`;
  },
};

export const printAst = (ast: Expr) => visit(astPrinter, ast);
