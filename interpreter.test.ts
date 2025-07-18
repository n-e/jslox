import test from "node:test";
import { interpret } from "./interpreter.ts";
import { deepStrictEqual } from "assert";

test("interpreter", () => {
  const r = interpret({
    type: "unary",
    operator: { type: "MINUS" },
    right: { type: "literal", value: { type: "number", value: 4 } },
  });
  deepStrictEqual(r, { type: "number", value: -4 });
});
