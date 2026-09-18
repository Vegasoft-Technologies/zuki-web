/**
 * The consent banner. It is hidden in the markup and revealed only once the stored
 * choice has been read in the browser, which cannot happen on the server.
 */
export default function CookieBanner() {
  return (
    <div
      className="cookie"
      id="cookie"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      hidden
    >
      <div className="cookie__inner">
        <p className="cookie__text">
          We use essential cookies to run this site, and — only if you allow — Google Maps
          to show you where we are. See our <a href="/privacy">Privacy & Cookie Policy</a>
          .
        </p>
        <div className="cookie__actions">
          <button
            className="btn btn--small btn--ghost-dark"
            type="button"
            data-cookie="essential"
          >
            Essential only
          </button>
          <button className="btn btn--small btn--gold" type="button" data-cookie="all">
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
