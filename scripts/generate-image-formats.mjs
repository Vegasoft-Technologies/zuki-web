// Writes an AVIF and a WebP next to every JPEG and PNG in public/images.
//
// The originals are kept under their original names, as the image rules require. The
// encoder is sharp, which arrives as a dependency of Next.js rather than of this
// project; if it is ever absent the script says so and stops rather than half-running.
//
// Run with: npm run images:formats
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "sharp is not available. It is installed with Next.js; run `npm install` first.",
  );
  process.exit(1);
}

const dir = path.resolve("public/images");
const sources = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

let before = 0;
let webpTotal = 0;
let avifTotal = 0;

for (const file of sources) {
  const input = path.join(dir, file);
  const base = file.replace(/\.(jpe?g|png)$/i, "");
  const original = (await stat(input)).size;
  before += original;

  const webp = await sharp(input)
    .webp({ quality: 82 })
    .toFile(path.join(dir, `${base}.webp`));
  const avif = await sharp(input)
    .avif({ quality: 60, effort: 4 })
    .toFile(path.join(dir, `${base}.avif`));
  webpTotal += webp.size;
  avifTotal += avif.size;

  const pct = (n) => `${Math.round((100 * n) / original)}%`.padStart(4);
  console.log(
    `${file.padEnd(24)} ${String(original).padStart(8)} B  webp ${pct(webp.size)}  avif ${pct(avif.size)}`,
  );
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(
  `\n${sources.length} images. originals ${kb(before)}, webp ${kb(webpTotal)}, avif ${kb(avifTotal)}`,
);
