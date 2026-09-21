import { getCloudflareContext } from "@opennextjs/cloudflare";
import { candidatePaths, chooseFormat, parseImageRequest } from "@/lib/imageVariants";

/**
 * Serves a pre-generated image in the best format the browser accepts. The loader
 * writes addresses of the form /img/<name>-<width>.<ext>; this route reads the Accept
 * header, tries the AVIF or WebP file first and falls back to the original format, so
 * every visitor receives one file sized for their screen. Next's own optimiser
 * negotiates the same way, and is unavailable on Workers.
 */

interface AssetFetcher {
  fetch(input: URL | Request): Promise<Response>;
}

/** The static assets, through the Workers binding when it exists and over HTTP otherwise. */
function assets(): AssetFetcher | null {
  try {
    const env = getCloudflareContext().env as { ASSETS?: AssetFetcher };
    return env.ASSETS ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const parsed = parseImageRequest(file);
  if (!parsed) return new Response("Not found", { status: 404 });

  const format = chooseFormat(request.headers.get("accept"), parsed.original);
  const binding = assets();
  for (const path of candidatePaths(parsed, format)) {
    const url = new URL(path, request.url);
    const asset = binding ? await binding.fetch(url) : await fetch(url);
    if (!asset.ok) continue;
    return new Response(asset.body, {
      status: 200,
      headers: {
        "content-type": asset.headers.get("content-type") ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
        vary: "Accept",
      },
    });
  }
  return new Response("Not found", { status: 404 });
}
