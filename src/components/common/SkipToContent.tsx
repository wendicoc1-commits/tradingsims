'use client';

/**
 * SkipToContent - a11y keyboard navigation skip link.
 * Visually hidden until focused via Tab key.
 * Allows screen reader / keyboard users to jump past navigation to main content.
 *
 * Usage: Place at the very top of the page body, before any navigation.
 * The target element must have id="main-content".
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-2
        focus:left-2
        focus:z-[9999]
        focus:px-4
        focus:py-2
        focus:bg-emerald-500
        focus:text-black
        focus:font-bold
        focus:text-sm
        focus:rounded-lg
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-300
        transition-none
      "
    >
      Langsung ke Konten Utama
    </a>
  );
}
