import test from "node:test";
import { parse } from "./parser.ts";
import { scan } from "./scanner.ts";
import assert, { strictEqual } from "node:assert";
import { printAst } from "./astPrinter.ts";

const thrown = (fun: Function) => {
  try {
    fun();
  } catch (error: any) {
    return error;
  }
  return null;
};

test("parser", () => {
  const tests: [string, string][] = [
    ["2", "2"],
    ["2==3", "(2 EQUAL_EQUAL 3)"],
    ["2==3!=4", "((2 EQUAL_EQUAL 3) BANG_EQUAL 4)"],
    ["1 < 2 == 3 > 4", "((1 LT 2) EQUAL_EQUAL (3 GT 4))"],
    ["!!2+3", "((BANG (BANG 2)) PLUS 3)"],
    ["1+2*3", "(1 PLUS (2 STAR 3))"],
  ];

  tests.forEach((t) => {
    const scanned = scan(t[0]);
    assert(scanned.errors.length === 0);
    const parsed = parse(scanned.tokens);
    const printed = printAst(parsed);
    strictEqual(printed, t[1]);
  });
});

test("parser errors", () => {
  const tests: [string, string][] = [["1+", "[1:3] Unexpected token EOF"]];

  tests.forEach((t) => {
    const scanned = scan(t[0]);
    assert(scanned.errors.length === 0);
    const err = thrown(() => parse(scanned.tokens));
    strictEqual(err.message, t[1]);
  });
});
