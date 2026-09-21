"use client";

import { clearConsent } from "@/lib/consent";
import { stopClarity } from "@/lib/analytics";

/**
 * Withdraws the cookie choice. The stored choice is cleared, analytics are told consent
 * is gone so their cookies are deleted, and the page reloads so nothing optional is left
 * running; the reloaded page shows the banner again.
 */
export default function ConsentReset() {
  const withdraw = () => {
    stopClarity();
    clearConsent();
    window.location.reload();
  };

  return (
    <button className="btn btn--small btn--gold" type="button" onClick={withdraw}>
      Change your cookie choice
    </button>
  );
}
