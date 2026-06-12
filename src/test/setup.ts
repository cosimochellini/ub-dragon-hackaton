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
