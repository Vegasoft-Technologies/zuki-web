/**
 * A booking control fixed within thumb reach on phones.
 *
 * The header's "Book a table" button is hidden below 921px, which leaves the only way
 * to book two taps deep inside the burger menu. This puts it back in one tap.
 *
 * It opens the booking form in the Visit section.
 */
import Link from "next/link";

export default function BookingBar() {
  return (
    <div className="booking-bar">
      <Link className="btn btn--gold booking-bar__action" href="/#book">
        <span className="btn__dot" aria-hidden="true"></span> Book a table
      </Link>
    </div>
  );
}
