/**
 * Microsoft Clarity, loaded only after the visitor has chosen "Accept all". Nothing in
 * this module runs on the server, and nothing here runs at all without a project
 * identifier, so the site works unchanged when analytics are not configured.
 */

declare global {
  interface Window {
    clarity?: { (...args: unknown[]): void; q?: unknown[] };
  }
}

const TAG_HOST = "https://www.clarity.ms/tag/";

/**
 * Pure. The configured project identifier, or null if there is none or it is not the
 * shape Clarity issues (letters and digits). Anything else is refused rather than put
 * into a script address.
 */
export function clarityProjectId(value: string | undefined): string | null {
  if (!value) return null;
  return /^[a-z0-9]{6,32}$/i.test(value) ? value : null;
}

/**
 * The project identifier is inlined at build time, which is what NEXT_PUBLIC_ means: it is
 * public configuration, not a secret, and the page must work without it.
 */
export const configuredProjectId = clarityProjectId(
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
);

let loaded = false;

/** Runs `work` once the page has finished loading and the browser is idle. */
function whenIdle(work: () => void): void {
  const schedule = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(work);
    else setTimeout(work, 1);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}

/**
 * Adds the Clarity tag to the page, once, after load, and tells it analytics storage is
 * consented and advertising storage is not. The masking of the booking form is on the
 * form itself (`data-clarity-mask`), so it does not depend on this call.
 */
export function loadClarity(projectId: string): void {
  if (loaded) return;
  loaded = true;
  whenIdle(() => {
    window.clarity =
      window.clarity ??
      function (...args: unknown[]) {
        (window.clarity!.q = window.clarity!.q ?? []).push(args);
      };
    const script = document.createElement("script");
    script.async = true;
    script.src = `${TAG_HOST}${projectId}`;
    document.head.appendChild(script);
    window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
  });
}

/**
 * Consent withdrawn: Clarity is told so, which makes it delete its cookies, and the page
 * is reloaded so that no analytics code is left running. On the reloaded page there is no
 * stored choice, so the banner is shown again and nothing loads.
 */
export function stopClarity(): void {
  try {
    window.clarity?.("consent", false);
  } catch {
    // Nothing to do: if the tag never loaded there is nothing to stop.
  }
}
