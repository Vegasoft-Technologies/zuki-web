import type { Metadata } from "next";
import Link from "next/link";
import { areaCopy, bookingCopy, confirmationMode, type Area } from "@/lib/booking/config";

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
    const area = one(params.area);
    const areaText =
      area === "inside" || area === "outside" ? areaCopy[area as Area] : null;
    body = copy.successBody;
    if (date && time)
      body += ` ${date} at ${time}${party ? `, party of ${party}` : ""}${areaText ? `, ${areaText.label.toLowerCase()}` : ""}.`;
    if (areaText?.note) body += ` ${areaText.note}`;
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
