/**
 * The widths the image files are generated at, in pixels. Shared by the generation
 * script, the loader and the route that serves them, so the three cannot disagree.
 *
 * Chosen from what the page asks for: the header logo at 64 px (128 on a 2x screen),
 * the hero logo at up to 222 px (444), the footer logo at 116 px (232), and the gallery
 * tiles at 44vw on a phone (330 at 2x), 29vw on a tablet (446) and 251 px on a desktop
 * (502, or 753 at 3x). Anything larger falls back to the original-size file.
 */
export const VARIANT_WIDTHS = [128, 256, 384, 512, 768] as const;

/** The smallest generated width that is at least `width`, or null if none is. */
export function variantWidthFor(width: number): number | null {
  return VARIANT_WIDTHS.find((w) => w >= width) ?? null;
}

export type ImageFormat = "avif" | "webp" | "jpg" | "png";

/** The best format the browser accepts, from its Accept header; falls back to the original. */
export function chooseFormat(
  accept: string | null,
  original: "jpg" | "png",
): ImageFormat {
  const a = accept ?? "";
  if (a.includes("image/avif")) return "avif";
  if (a.includes("image/webp")) return "webp";
  return original;
}

export interface ImageRequest {
  name: string;
  width: number | null;
  original: "jpg" | "png";
}

/** Parses "<name>-<width>.<ext>" or "<name>.<ext>", or null if it is not one of ours. */
export function parseImageRequest(file: string): ImageRequest | null {
  const m = /^([a-z0-9]+(?:-[a-z]+)*(?:-\d\d)?)(?:-(\d+))?\.(jpg|png)$/.exec(file);
  if (!m) return null;
  const width = m[2] === undefined ? null : Number(m[2]);
  if (width !== null && !(VARIANT_WIDTHS as readonly number[]).includes(width))
    return null;
  return { name: m[1], width, original: m[3] as "jpg" | "png" };
}

/**
 * The files to try, best first: the requested width in the negotiated format, the
 * original size in that format, then the same two in the original format. The later
 * entries exist because a source smaller than a variant width has no file at that width.
 */
export function candidatePaths(request: ImageRequest, format: ImageFormat): string[] {
  const { name, width, original } = request;
  const formats = format === original ? [original] : [format, original];
  const paths: string[] = [];
  for (const f of formats) {
    if (width !== null) paths.push(`/images/${name}-${width}.${f}`);
    paths.push(`/images/${name}.${f}`);
  }
  return paths;
}
