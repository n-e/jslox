import assert from "assert";
import { visit, type Expr, type ExprVisitor } from "./types/ast.ts";

type InterpretResult =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "boolean"; value: boolean }
  | { type: "nil" };

const interpreter: ExprVisitor<InterpretResult> = {
  unary(expr) {
    const right = interpret(expr.right);
    switch (expr.operator.type) {
      case "MINUS":
        assert(right.type === "number");
        return { type: "number", value: -right.value };
      case "BANG":
        assert(right.type === "boolean");
        return { type: "boolean", value: !right.value };
      default:
        throw "nope";
    }
  },
  binary(expr) {
    throw "not implemented";
  },
  grouping(expr) {
    throw "not implemented";
  },
  literal(expr) {
    const v = expr.value;
    return v;
  },
};

export const interpret = (expr: Expr) => visit(interpreter, expr);
