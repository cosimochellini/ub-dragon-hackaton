// Augments Vite's built-in `ImportMetaEnv` (from the `vite/client` types) with
// the project's custom environment variables. Declaration merging requires an
// `interface`, so this is intentionally not a `type` alias.
interface ImportMetaEnv {
  /**
   * Absolute production origin (no trailing slash needed) used to build the
   * canonical URL and absolute Open Graph / Twitter image URLs. Configured in
   * the Netlify site environment; falls back to the default deploy URL.
   */
  readonly VITE_SITE_URL?: string
}
