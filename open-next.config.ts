import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// The incremental cache lives in Workers KV and revalidations are queued through a
// Durable Object; both are bound in wrangler.jsonc. Without the cache the rating badge's
// daily revalidation would silently degrade to build-time only. KV rather than R2 because
// R2 needs a payment method on the account; see docs/decisions/0005-hosting.md.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
});
