import { variantWidthFor } from "./imageVariants.ts";

/**
 * The image loader for next/image. Turns a request for a source image at a width into
 * the address of a pre-generated file, served by the /img route, which chooses AVIF,
 * WebP or the original format from what the browser accepts.
 *
 * Static imports arrive as "/_next/static/media/<name>.<hash>.<ext>". The hash changes
 * whenever the file does, so it is carried as a version query and the response can be
 * cached for a year. Anything that is not a static import is returned unchanged.
 */
export default function imageLoader({ src, width }: { src: string; width: number }) {
  const m = /^\/_next\/static\/media\/([^/.]+)\.([a-z0-9_-]+)\.(jpe?g|png)$/i.exec(src);
  if (!m) return src;
  const [, name, hash, rawExt] = m;
  const ext = rawExt.toLowerCase() === "png" ? "png" : "jpg";
  const variant = variantWidthFor(width);
  const file = variant === null ? `${name}.${ext}` : `${name}-${variant}.${ext}`;
  return `/img/${file}?v=${hash}`;
}
