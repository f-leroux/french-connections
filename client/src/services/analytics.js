// client/src/services/analytics.js

// Records a custom event in GoatCounter (loaded by public/index.html). It shows up in the
// dashboard next to page views, marked as an event. No-op when the script is blocked, and
// GoatCounter itself ignores localhost, so development doesn't skew the stats.
export function trackEvent(path, title) {
  if (window.goatcounter && window.goatcounter.count) {
    window.goatcounter.count({ path, title, event: true });
  }
}
