/**
 * Absolute production origin for canonical + Open Graph/Twitter URLs. Set
 * `VITE_SITE_URL` in the Netlify environment to override; the fallback is the
 * default deploy URL. Trailing slashes are trimmed so paths can be appended.
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? 'https://ub-dragon.netlify.app'
).replace(/\/+$/, '')
