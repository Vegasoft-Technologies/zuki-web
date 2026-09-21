import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// The incremental cache lives in R2 and revalidations are queued through a Durable
// Object; both are bound in wrangler.jsonc. Without the cache the rating badge's daily
// revalidation would silently degrade to build-time only.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
});
