const fs = require("fs");
const path = require("path");
const ts = require("typescript");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const compilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  esModuleInterop: true,
  skipLibCheck: true,
};

function convert(file) {
  const code = fs.readFileSync(file, "utf8");
  const fileName = file.endsWith(".js") ? file.replace(/\.js$/, ".ts") : file;
  const { outputText } = ts.transpileModule(code, { compilerOptions, fileName });
  const dest = file.replace(/\.tsx?$/, ".js");
  fs.writeFileSync(dest, outputText.replace(/^\uFEFF/, ""));
  if (path.resolve(file) !== path.resolve(dest)) {
    fs.unlinkSync(file);
  }
}

const backendRoot = path.join(__dirname, "..");
const src = path.join(backendRoot, "src");

for (const file of walk(src)) {
  if (file.endsWith(".d.ts")) {
    fs.unlinkSync(file);
    continue;
  }
  if (file.endsWith(".ts") || file.endsWith(".js")) {
    convert(file);
  }
}

const drizzleConfig = path.join(backendRoot, "drizzle.config.ts");
if (fs.existsSync(drizzleConfig)) {
  convert(drizzleConfig);
}

console.log("Converted backend TypeScript to CommonJS JavaScript.");
