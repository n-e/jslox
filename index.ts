import { argv, stdin, stdout } from "process";
import { scan } from "./scanner.ts";
import { readFile } from "fs/promises";
import { createInterface } from "readline";
import { printAst } from "./astPrinter.ts";
import { parse } from "./parser.ts";

const file = argv[2];

const action = (src: string) => {
  try {
    const scanned = scan(src);
    if (scanned.errors.length > 0) console.error(scanned.errors);

    console.error(printAst(parse(scanned.tokens)));
  } catch (error) {
    console.error(error);
  }
};

if (file) {
  action(await readFile(file, "utf8"));
} else {
  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: "jslox>",
  });

  rl.prompt();
  rl.on("line", (l) => {
    action(l);
    rl.prompt();
  });
}
