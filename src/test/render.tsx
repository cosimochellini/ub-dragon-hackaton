import { createContext, use } from 'react'
import { render } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

/**
 * Test helper for rendering UI that contains TanStack Router `<Link>`s without
 * booting the full app router.
 *
 * A stable in-memory router supplies router context and registers the paths the
 * cards link to (so `<Link>` can build hrefs). The rendered UI is passed through
 * React context into the index route, and the router lives *below* the context
 * provider — so RTL's `rerender` simply updates the context value and the UI
 * re-renders in place (key-based remounts still work), while the router stays
 * mounted.
 */
const UiContext = createContext<ReactNode>(null)

function UiOutlet() {
  return <>{use(UiContext)}</>
}

const rootRoute = createRootRoute({ component: Outlet })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: UiOutlet,
})
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/therapist/$id',
  component: () => null,
})
const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, profileRoute]),
  history: createMemoryHistory({ initialEntries: ['/'] }),
})
// Resolve the initial match up front so `RouterProvider` paints synchronously on
// mount (otherwise its first render is empty and sync queries find nothing).
await router.load()

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <UiContext value={children}>
      <RouterProvider router={router} />
    </UiContext>
  )
}

export function renderWithRouter(ui: ReactNode) {
  return render(ui, { wrapper: Wrapper })
}
