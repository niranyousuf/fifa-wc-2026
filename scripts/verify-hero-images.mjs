import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { images } = JSON.parse(
  readFileSync(join(root, "data/hero-promo-images.json"), "utf8"),
);

/** Pexels IDs that were mis-tagged (e.g. tennis sold as soccer). */
const BLOCKED_PEXELS_IDS = new Set(["209977"]);

let failed = 0;

for (const { url, alt } of images) {
  const pexelsMatch = url.match(/pexels\.com\/photos\/(\d+)\//);
  if (pexelsMatch && BLOCKED_PEXELS_IDS.has(pexelsMatch[1])) {
    console.error("BLOCKED mis-tagged Pexels id", pexelsMatch[1], alt);
    failed += 1;
  }
}

for (const { url, alt } of images) {
  let res = await fetch(url, { method: "HEAD" });
  if (!res.ok) {
    res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
  }
  if (res.ok) {
    console.log("OK", alt);
  } else {
    console.error("FAIL", res.status, alt, url);
    failed += 1;
  }
}

process.exit(failed > 0 ? 1 : 0);
