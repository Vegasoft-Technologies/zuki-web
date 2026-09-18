## What changed

<!-- One or two sentences. If you need an "and", consider splitting the pull request. -->

## Why

<!-- The reason for the change, not a restatement of the diff. Link an issue if there is one. -->

## How it was tested

<!-- Commands you ran and what they printed. Measurements beat impressions. -->

## Screenshots

<!-- Required for any change a visitor can see. All three widths. -->

| 375px | 768px | 1280px |
| ----- | ----- | ------ |
|       |       |        |

## Checklist

- [ ] `npm run lint`, then `npm run build`, then `npx tsc --noEmit` — all pass.
      The order matters: the type check needs the route types the build generates.
- [ ] `npm run format:check` passes.
- [ ] Checked at 375px first, then 768px and 1280px.
- [ ] No horizontal scrolling at 375px.
- [ ] No console errors and no hydration warnings.
- [ ] CSS class names are unchanged, and `src/app/globals.css` is untouched.
- [ ] Accessibility attributes are preserved: `role`, `aria-*`, and a visible focus state
      on anything interactive.
- [ ] Content lives in `src/data/`, not in JSX.
- [ ] No new dependency, or one with a stated reason below.
- [ ] One logical change.
