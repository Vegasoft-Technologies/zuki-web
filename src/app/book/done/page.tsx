import type { Metadata } from "next";
import Link from "next/link";
import { bookingCopy, confirmationMode } from "@/lib/booking/config";

export const metadata: Metadata = {
  title: "Your booking — Zuki's Caffetteria",
  robots: { index: false, follow: false },
};

/**
 * Where a visitor without scripting lands after posting the booking form. The scripted
 * form never navigates here; it shows the same words in place.
 */
export default async function BookingDonePage({ searchParams }: PageProps<"/book/done">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = one(params.status);
  const mode = confirmationMode();

  let heading = "Something went wrong";
  let body = one(params.message) || "Please go back and try again, or telephone us.";
  if (status === "held" || status === "received") {
    const copy = bookingCopy[status === "held" ? "instant" : "manual"];
    heading = copy.successHeading;
    const date = one(params.date);
    const time = one(params.time);
    const party = one(params.party);
    body = copy.successBody;
    if (date && time) body += ` ${date} at ${time}${party ? `, party of ${party}` : ""}.`;
    if (status === "received" && mode === "instant") {
      body = bookingCopy.manual.successBody;
    }
  }

  return (
    <main className="legal">
      <Link className="legal__back" href="/#book">
        ← Back to Zuki&apos;s
      </Link>
      <h1>{heading}</h1>
      <p>{body}</p>
    </main>
  );
}
