# 0008 — Generated image files are committed

**Status:** accepted, 2026-09-21

## Context

The site serves each photograph at one of five widths (128, 256, 384, 512 and 768 px) in
AVIF, WebP and the original format, chosen by the `/img` route from what the browser
accepts (`0005-hosting.md`, "The cost that comes with it"). Those files have to exist
before a request arrives: Workers has no Node runtime, so nothing can be resized on the
way out.

There were two places to make them: during the build, on the deployment runner, or once,
by hand, with the result committed. The first set of generated files — the full-size AVIF
and WebP added on 2026-09-20 — was committed, so the second set followed the precedent.
It added 351 files and 16.1 MB to the repository in one change.

## Decision

Generated image files are **committed**, produced by `npm run images:formats`, and the
generation step is run **only when a source image changes**.

Why committed rather than built:

- **The deployment stays simple.** The runner does `npm ci`, `next build` and the
  adapter's build. Encoding 350 files there, on every push, would add minutes to every
  deployment and preview, and would make the deployed set depend on the encoder version on
  the runner rather than on what was reviewed.
- **What is served is what was reviewed.** A pull request that changes a photograph shows
  the exact bytes that will be served; a regeneration can be looked at before it goes live.
- **It follows the existing set.** The full-size AVIF and WebP files were already
  committed; two conventions for the same kind of file would be worse than either.

## What it costs

- **Repository size.** `public/images/` is 35 MB, of which 24 MB is generated. A clone
  carries all of it.
- **History only grows.** Git does not delta-compress binaries. Every regenerated file is
  stored in full in history for ever, even after it is replaced or removed from the tree.
  Regenerating the whole set repeatedly — after an encoder upgrade, a quality tweak, or by
  running the script without need — would add the full 24 MB to history each time.

For that reason the script writes a file only when it is missing or older than its
source, and **the generation step must run only when the source images actually change**:
a new photograph, a replaced one, or a deliberate, recorded change of format or width. It
is not part of the build and must not be added to it.

## When to revisit

- **If the photograph set is replaced wholesale.** A new set means regenerating
  everything, and that is the moment to decide whether to move generation to the build (or
  to a storage bucket populated by a one-off job) rather than pay the history cost again.
- **If the repository becomes slow to clone.** A rule of thumb: when a fresh clone passes
  roughly 100 MB, or when a second regeneration is on the table, the alternative is to
  generate on the runner into the assets directory and stop committing the output.
- **If the widths change.** Adding a width adds 72 files; changing one replaces 72 and
  leaves the old 72 in history.

## Consequences

- `docs/content-guide.md` tells whoever adds a photograph to run the script and commit
  its output with the photograph.
- A reviewer who sees a pull request regenerate files whose sources did not change should
  ask why before merging.
- The alternative is written down here, so the next person does not have to rediscover
  the trade-off.
