import assert from "node:assert/strict";
import test from "node:test";
import imageLoader from "./imageLoader.ts";
import {
  candidatePaths,
  chooseFormat,
  parseImageRequest,
  variantWidthFor,
} from "./imageVariants.ts";

test("a static import at a width becomes the smallest generated file that is large enough", () => {
  const src = "/_next/static/media/gallery-04.3u-xki0aav-il.jpg";
  assert.equal(
    imageLoader({ src, width: 128 }),
    "/img/gallery-04-128.jpg?v=3u-xki0aav-il",
  );
  assert.equal(
    imageLoader({ src, width: 330 }),
    "/img/gallery-04-384.jpg?v=3u-xki0aav-il",
  );
  assert.equal(
    imageLoader({ src, width: 768 }),
    "/img/gallery-04-768.jpg?v=3u-xki0aav-il",
  );
});

test("a width larger than any generated variant asks for the original size", () => {
  const src = "/_next/static/media/logo.abc123.png";
  assert.equal(imageLoader({ src, width: 1080 }), "/img/logo.png?v=abc123");
  assert.equal(variantWidthFor(769), null);
});

test("anything that is not a static import is left alone", () => {
  assert.equal(imageLoader({ src: "/images/vine.svg", width: 64 }), "/images/vine.svg");
  assert.equal(
    imageLoader({ src: "https://x.example/a.jpg", width: 64 }),
    "https://x.example/a.jpg",
  );
});

test("the format follows the Accept header and falls back to the original", () => {
  assert.equal(chooseFormat("image/avif,image/webp,*/*", "jpg"), "avif");
  assert.equal(chooseFormat("image/webp,*/*", "jpg"), "webp");
  assert.equal(chooseFormat("image/jpeg,*/*", "jpg"), "jpg");
  assert.equal(chooseFormat(null, "png"), "png");
});

test("only our own file names are accepted, at generated widths only", () => {
  assert.deepEqual(parseImageRequest("gallery-04-384.jpg"), {
    name: "gallery-04",
    width: 384,
    original: "jpg",
  });
  assert.deepEqual(parseImageRequest("turkish-breakfast.jpg"), {
    name: "turkish-breakfast",
    width: null,
    original: "jpg",
  });
  assert.deepEqual(parseImageRequest("vegasoft-logo-128.png"), {
    name: "vegasoft-logo",
    width: 128,
    original: "png",
  });
  assert.equal(parseImageRequest("gallery-04-333.jpg"), null);
  assert.equal(parseImageRequest("../secret.jpg"), null);
  assert.equal(parseImageRequest("gallery-04.svg"), null);
});

test("candidates run from the best file to the plain original", () => {
  const req = {
    name: "gallery-06",
    width: 768 as number | null,
    original: "jpg" as const,
  };
  assert.deepEqual(candidatePaths(req, "avif"), [
    "/images/gallery-06-768.avif",
    "/images/gallery-06.avif",
    "/images/gallery-06-768.jpg",
    "/images/gallery-06.jpg",
  ]);
  assert.deepEqual(candidatePaths({ ...req, width: null }, "jpg"), [
    "/images/gallery-06.jpg",
  ]);
});
