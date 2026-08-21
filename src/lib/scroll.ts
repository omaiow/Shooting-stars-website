/**
 * Smooth-scroll to a section by CSS selector (e.g. '#work').
 * Consolidates the repeated scrollIntoView pattern used across the portfolio.
 */
export function scrollToSection(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}
