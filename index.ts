import { argv, stdin, stdout } from "process";
import { scan } from "./scanner.ts";
import { readFile } from "fs/promises";
import { createInterface } from "readline";

const file = argv[2];

if (file) {
  console.error(scan(await readFile(file, "utf8")));
} else {
  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: "jslox>",
  });

  rl.prompt();
  rl.on("line", (l) => {
    console.error(scan(l));
    rl.prompt();
  });
}
