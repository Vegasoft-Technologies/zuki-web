/**
 * The live "open now" line. The element and its live region are in place; the status
 * itself is computed in the browser, because the server clock is not the visitor's.
 */
export default function OpeningStatus() {
  return <p className="hero__status" id="heroStatus" aria-live="polite"></p>;
}
