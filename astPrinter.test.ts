import test from "node:test";
import { printAst } from "./astPrinter.ts";
import { equal } from "assert";

test("astPrinter", () => {
  const r = printAst({
    type: "binary",
    left: { type: "literal", value: { type: "number", value: 3 } },
    right: { type: "literal", value: { type: "number", value: 2 } },
    operator: { type: "STAR" },
  });
  equal(r, "(3 STAR 2)");
});
