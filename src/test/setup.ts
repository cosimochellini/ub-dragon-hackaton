import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// jsdom doesn't implement these APIs that some components touch. The lib.dom
// types declare them as always-present, so widen before probing at runtime.
const elementProto = Element.prototype as { scrollTo?: unknown }
if (!elementProto.scrollTo) {
  elementProto.scrollTo = () => {}
}

const win = globalThis as { matchMedia?: unknown }
if (!win.matchMedia) {
  win.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom has no IntersectionObserver; the progressive-reveal list constructs one
// in an effect. A no-op stub lets that effect set up and tear down cleanly. It
// never invokes its callback, so reveal in tests is driven by the button click.
const ioHost = globalThis as { IntersectionObserver?: unknown }
if (!ioHost.IntersectionObserver) {
  ioHost.IntersectionObserver = class {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}
