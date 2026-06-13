import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import { SITE_URL } from '@/lib/site'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const SITE_NAME = 'Unobravo'
const PAGE_TITLE = 'Therapists in Milan · Unobravo'
const PAGE_DESCRIPTION =
  'Find an in-person therapist in Milan and book a free intro call straight from the directory.'
const OG_IMAGE = `${SITE_URL}/og-image.png`
const OG_IMAGE_ALT = 'Therapists in Milan — Unobravo'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        // eslint-disable-next-line unicorn/text-encoding-identifier-case -- "utf-8" is the canonical HTML charset value
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      // This is a POC seeded with mock therapist data, so it must not be indexed
      // by search engines under the real Unobravo brand. `noindex` is enforced
      // here (the authoritative signal) rather than via robots.txt `Disallow`,
      // which would block crawlers from ever reading this tag and could stop
      // social scrapers from fetching the Open Graph image.
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
      {
        name: 'description',
        content: PAGE_DESCRIPTION,
      },
      {
        name: 'theme-color',
        content: '#D33C00',
      },
      {
        title: PAGE_TITLE,
      },
      // Open Graph (Facebook, LinkedIn, Slack, WhatsApp, …)
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: PAGE_TITLE },
      { property: 'og:description', content: PAGE_DESCRIPTION },
      { property: 'og:url', content: `${SITE_URL}/` },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: OG_IMAGE_ALT },
      { property: 'og:locale', content: 'en_US' },
      // Twitter / X
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: PAGE_TITLE },
      { name: 'twitter:description', content: PAGE_DESCRIPTION },
      { name: 'twitter:image', content: OG_IMAGE },
      { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      // `canonical` is emitted per route (each page is its own canonical), not
      // here — a single root canonical would point every route at `/`.
      // Favicons. The .ico (16/32/48) covers legacy browsers and Google Search;
      // the SVG is used by modern browsers and scales crisply.
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
        sizes: '16x16 32x32 48x48',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
        sizes: '180x180',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
      // The display font (ES Rebond Grotesque Bold) is intentionally NOT
      // preloaded. It loads via @font-face with `font-display: swap`, so the
      // 'Inter' fallback paints immediately and the woff swaps in when ready.
      // A preload here only ever triggered the browser "preloaded resource was
      // not used within a few seconds" warning (same reason the Regular preload
      // was dropped in 346b92d) without a measurable paint win on this POC.
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
