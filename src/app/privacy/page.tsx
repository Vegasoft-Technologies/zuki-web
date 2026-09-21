import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/data/site";
import ConsentReset from "@/components/ui/ConsentReset";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy — Zuki's Caffetteria",
  description:
    "How Zuki's Caffetteria looks after your privacy on this website, what a table booking collects, and how cookies are used.",
  alternates: { canonical: `${site.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="legal">
      <Link className="legal__back" href="/">
        ← Back to Zuki&apos;s
      </Link>
      <h1>Privacy &amp; Cookie Policy</h1>
      <p className="legal__updated">Last updated: 21 September 2026</p>

      <p>
        This policy explains how <strong>Zuki&apos;s Caffetteria</strong> (&quot;we&quot;,
        &quot;us&quot;) looks after your privacy when you visit this website or book a
        table through it, and how we use cookies. We keep things simple, because this site
        is here to show you our café — not to collect data about you.
      </p>

      <h2>Who we are</h2>
      <p>
        {site.name}, {site.address.street}, {site.address.locality}{" "}
        {site.address.postcode}, {site.address.country}.
        <br />
        Phone: <a href={`tel:${site.telephone}`}>{site.telephoneDisplay}</a> · Instagram:{" "}
        <a href={site.social.instagram} target="_blank" rel="noopener">
          @zukiscaffetteria
        </a>
      </p>
      <p>For any privacy question, just call us or message us on Instagram.</p>

      <h2>Booking a table</h2>
      <p>
        When you book a table on this site we collect{" "}
        <strong>
          your name, the size of your party, the date and time, and one way to reach you
        </strong>{" "}
        — a telephone number or an email address, whichever you give — and any note you
        choose to add.
      </p>
      <ul>
        <li>
          <strong>Why:</strong> to hold your table and to contact you about that booking.
          Nothing else. We do not use these details for marketing and we do not add you to
          any list.
        </li>
        <li>
          <strong>Lawful basis:</strong> the booking is a step towards a contract you have
          asked for (UK GDPR, Article 6(1)(b)). No consent box is needed and none is
          shown.
        </li>
        <li>
          <strong>How long we keep it:</strong> 30 days after the date of your booking,
          then it is deleted.
        </li>
        <li>
          <strong>Who sees it:</strong> the café, and the service that delivers the
          booking notice to us, which acts only on our instructions. Nobody else.
        </li>
        <li>
          <strong>Your choices:</strong> to see, correct or delete a booking&apos;s
          details, call us or message us on Instagram and we will do it.
        </li>
      </ul>

      <h2>What else we collect</h2>
      <p>
        Nothing. Apart from a booking, this website has no accounts, no sign-in and no
        payments. If you place a food order or write a review, that happens on a
        third-party platform (Deliveroo, Just Eat or Tripadvisor) under their own privacy
        policies — not ours.
      </p>

      <h2>Cookies &amp; similar storage</h2>
      <p>We use the smallest possible set:</p>
      <ul>
        <li>
          <strong>Your cookie choice</strong> — when you choose &quot;Accept all&quot; or
          &quot;Essential only&quot;, we remember that in your browser&apos;s local
          storage so we don&apos;t ask again. This never leaves your device.
        </li>
        <li>
          <strong>Google Maps</strong> — the map showing our location loads from Google
          and may set Google cookies. It only loads <strong>after</strong> you accept it
          (either with &quot;Accept all&quot;, or by clicking &quot;Show map&quot;). If
          you choose &quot;Essential only&quot;, the map stays off.
        </li>
        <li>
          <strong>Microsoft Clarity</strong> — only if you choose &quot;Accept all&quot;,
          we use Microsoft Clarity to understand how the site is used: which parts of a
          page are read, where people tap, and replays of how a visit went. It sets
          cookies (<code>_clck</code> and <code>_clsk</code>) to tell one visit from the
          next. It never loads before you choose, and never if you choose &quot;Essential
          only&quot;. Everything you type into the booking form is masked before it leaves
          your browser, so your name, telephone number, email address and note are never
          recorded. The processor is Microsoft Ireland Operations Limited, under{" "}
          <a
            href="https://privacy.microsoft.com/privacystatement"
            target="_blank"
            rel="noopener"
          >
            Microsoft&apos;s privacy statement
          </a>
          .
        </li>
        <li>
          <strong>Typefaces</strong> — our fonts are served from this website itself. No
          request goes to a font provider and no cookies are set.
        </li>
      </ul>
      <h3>Changing your mind</h3>
      <p>
        You can withdraw your choice at any time. This button forgets it, tells Microsoft
        Clarity to delete its cookies, and brings the banner back so you can choose again:
      </p>
      <p>
        <ConsentReset />
      </p>
      <p>Clearing this site&apos;s data in your browser does the same.</p>

      <h2>Links to other sites</h2>
      <p>
        When you tap a button to Deliveroo, Just Eat, Tripadvisor or Instagram, you leave
        this website. We&apos;re not responsible for how those services handle your data —
        please read their own policies.
      </p>

      <h2>Your rights</h2>
      <p>
        Under UK data protection law (UK GDPR), you have rights over any personal data an
        organisation holds about you, including the right to access it, correct it, or
        have it deleted. The only personal data this website holds is a table booking,
        described above. If you&apos;ve contacted us directly (by phone or Instagram) and
        want us to remove your details, get in touch and we&apos;ll sort it out.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change how the site works, we&apos;ll update this page and the &quot;last
        updated&quot; date above.
      </p>
    </main>
  );
}
