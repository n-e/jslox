import { deepStrictEqual } from "assert";
import test from "node:test";
import { scan } from "./scanner.ts";

test("scan()", () => {
  const tests: [string, unknown][] = [
    [
      "var testi = test;",
      "VAR IDENTIFIER:testi EQUAL IDENTIFIER:test SEMICOLON EOF",
    ],
    ["123", "NUMBER:123 EOF"],
    ['"123"', "STRING:123 EOF"],
  ];

  tests.forEach((t) => {
    test(t[0], () => {
      const r = scan(t[0]);
      deepStrictEqual(r.errors, []);
      deepStrictEqual(
        r.tokens
          .map((x) => ("literal" in x ? `${x.type}:${x.literal}` : x.type))
          .join(" "),
        t[1]
      );
    });
  });
});
