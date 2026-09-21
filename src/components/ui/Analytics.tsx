"use client";

import { useEffect, useSyncExternalStore } from "react";
import { configuredProjectId, loadClarity } from "@/lib/analytics";
import { getConsent, getServerConsent, subscribe } from "@/lib/consent";

/**
 * Loads Microsoft Clarity after the visitor has chosen "Accept all", and not before: not
 * on "Essential only", not while the banner is still open, and never on the server. It
 * reads the same stored choice as the map, so a visitor who accepted on an earlier visit
 * gets it on the next page load without being asked again. Renders nothing.
 */
export default function Analytics() {
  const consent = useSyncExternalStore(subscribe, getConsent, getServerConsent);

  useEffect(() => {
    if (consent === "all" && configuredProjectId) loadClarity(configuredProjectId);
  }, [consent]);

  return null;
}
