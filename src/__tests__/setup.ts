import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock IntersectionObserver for DotLottieReact (not available in jsdom)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() { /* noop */ }
  unobserve() { /* noop */ }
  disconnect() { /* noop */ }
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
globalThis.IntersectionObserver = MockIntersectionObserver;

// Mock @lottiefiles/dotlottie-react to avoid canvas/wasm overhead in tests
vi.mock('@lottiefiles/dotlottie-react', () => ({
  DotLottieReact: () => null,
}));
