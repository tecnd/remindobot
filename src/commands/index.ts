import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Find and dynamically load command files to register them in the command registry

const __dirname = dirname(fileURLToPath(import.meta.url));
const ext = import.meta.url.endsWith(".ts") ? ".ts" : ".js";

const files = readdirSync(__dirname).filter(
  (f) => f.endsWith(ext) && ![`index${ext}`, `registry${ext}`].includes(f),
);

for (const file of files) {
  console.log(`Loading ${file}...`);
  await import(pathToFileURL(join(__dirname, file)).href);
}

export { commands } from "./registry.js";
