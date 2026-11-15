import "./ArrowButton.css";

/* The site's one previous/next button: a hand-drawn-looking ring in the text colour
   with a thin arrow, filling with the primary blue on hover or focus. The two
   directions get slightly different ring shapes so a pair never looks stamped. */
export default function ArrowButton({ dir, className = "", ...props }) {
  return (
    <button type="button" className={`arrow-btn${dir === "next" ? " is-next" : ""}${className ? " " + className : ""}`} {...props}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "prev" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} />
      </svg>
    </button>
  );
}
