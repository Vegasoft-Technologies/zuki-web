import { site } from "@/data/site";

/**
 * A booking control fixed within thumb reach on phones.
 *
 * The header's "Book a table" button is hidden below 921px, which leaves the only way
 * to book two taps deep inside the burger menu. This puts it back in one tap.
 *
 * It dials the cafe today. When the booking API arrives, this is the single control
 * that changes: the href becomes the booking route and nothing else moves.
 */
export default function BookingBar() {
  return (
    <div className="booking-bar">
      <a className="btn btn--gold booking-bar__action" href={`tel:${site.telephone}`}>
        <span className="btn__dot" aria-hidden="true"></span> Book a table
      </a>
    </div>
  );
}
