"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

type Outcome = "idle" | "copied" | "select";

const RESET_AFTER_MS = 2500;

/**
 * The postal address with a one-tap copy control.
 *
 * Copying uses the Clipboard API when the browser offers it and the visitor allows
 * it. When it is missing or refused, the address is selected on screen instead and the
 * visitor is told to copy it by hand, so the control never does nothing in silence.
 */
export default function CopyAddress() {
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const addressRef = useRef<HTMLParagraphElement>(null);

  const text = `${site.address.street}, ${site.address.locality} ${site.address.postcode}`;

  useEffect(() => {
    if (outcome === "idle") return;
    const timer = setTimeout(() => setOutcome("idle"), RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [outcome]);

  const selectAddress = () => {
    const node = addressRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setOutcome("copied");
    } catch {
      selectAddress();
      setOutcome("select");
    }
  };

  return (
    <>
      <p ref={addressRef}>
        {site.address.street}
        <br />
        {`${site.address.locality} ${site.address.postcode}`}
        <br />
        {site.address.country}
      </p>
      <div className="copy-address">
        <button className="btn btn--small" type="button" onClick={copy}>
          Copy address
        </button>
        <span className="copy-address__status" role="status" aria-live="polite">
          {outcome === "copied" && "Copied"}
          {outcome === "select" &&
            "Copying is blocked here — the address is selected, press copy"}
        </span>
      </div>
    </>
  );
}
