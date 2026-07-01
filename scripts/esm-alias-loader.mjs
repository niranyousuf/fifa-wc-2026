import { existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { pathToFileURL } from "node:url";

function resolveAliasPath(specifier) {
  const sourcePath = pathResolve(process.cwd(), specifier.slice(2));
  const candidates = [
    sourcePath,
    `${sourcePath}.js`,
    `${sourcePath}.mjs`,
    pathResolve(sourcePath, "index.js"),
    pathResolve(sourcePath, "index.mjs"),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const targetPath = resolveAliasPath(specifier);
    if (targetPath) {
      return defaultResolve(pathToFileURL(targetPath).href, context, defaultResolve);
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
