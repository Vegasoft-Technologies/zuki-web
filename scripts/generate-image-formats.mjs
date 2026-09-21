// Writes the files the image loader serves, next to every JPEG and PNG in public/images:
//
//   - an AVIF and a WebP of the original size, and
//   - for each width in WIDTHS smaller than the original, a resized copy in the original
//     format, in WebP and in AVIF, named `<name>-<width>.<ext>`.
//
// The originals are kept under their original names, as the image rules require. A file
// is only written when it is missing or older than its source, so the script is safe to
// rerun and quick when nothing changed. The encoder is sharp, which arrives as a
// dependency of Next.js rather than of this project; if it is ever absent the script
// says so and stops rather than half-running.
//
// Run with: npm run images:formats
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { VARIANT_WIDTHS } from "../src/lib/imageVariants.ts";

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

const mtime = async (file) => {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return 0;
  }
};

const totals = { original: 0, written: 0, skipped: 0 };
const byFormat = {};

// Encodes `pipeline` to `file` in the given format unless the file is already current.
async function write(pipeline, file, format, sourceTime) {
  if ((await mtime(file)) >= sourceTime) {
    totals.skipped += 1;
    byFormat[format] = (byFormat[format] ?? 0) + (await stat(file)).size;
    return;
  }
  const encoded =
    format === "avif"
      ? pipeline.avif({ quality: 60, effort: 4 })
      : format === "webp"
        ? pipeline.webp({ quality: 82 })
        : format === "png"
          ? pipeline.png({ compressionLevel: 9 })
          : pipeline.jpeg({ quality: 82, mozjpeg: true });
  const info = await encoded.toFile(file);
  totals.written += 1;
  byFormat[format] = (byFormat[format] ?? 0) + info.size;
}

for (const file of sources) {
  const input = path.join(dir, file);
  const ext = file.replace(/^.*\./, "").toLowerCase().replace("jpeg", "jpg");
  const base = file.replace(/\.(jpe?g|png)$/i, "");
  const sourceTime = await mtime(input);
  const { width } = await sharp(input).metadata();
  totals.original += (await stat(input)).size;

  await write(sharp(input), path.join(dir, `${base}.webp`), "webp", sourceTime);
  await write(sharp(input), path.join(dir, `${base}.avif`), "avif", sourceTime);

  const widths = VARIANT_WIDTHS.filter((w) => w < width);
  for (const w of widths) {
    for (const format of [ext, "webp", "avif"]) {
      await write(
        sharp(input).resize({ width: w }),
        path.join(dir, `${base}-${w}.${format}`),
        format,
        sourceTime,
      );
    }
  }
  console.log(
    `${file.padEnd(24)} ${String(width).padStart(5)} px wide, variants at ${widths.join(", ") || "none"}`,
  );
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(
  `\n${sources.length} sources, ${kb(totals.original)}. ${totals.written} files written, ${totals.skipped} already current.`,
);
for (const [format, bytes] of Object.entries(byFormat).sort()) {
  console.log(`  ${format.padEnd(5)} ${kb(bytes)}`);
}
