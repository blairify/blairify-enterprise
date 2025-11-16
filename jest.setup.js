/* eslint-disable @typescript-eslint/no-var-requires */
// Jest setup file: run after test environment is ready

require("@testing-library/jest-dom");

// Basic mock for next/navigation to keep component tests stable
jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");

  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }),
  };
});

// Mock next/headers so server helpers can be exercised in Jest
jest.mock("next/headers", () => {
  const cookieStore = new Map();

  return {
    cookies: async () => ({
      get: (name) => {
        const value = cookieStore.get(name);
        return value ? { name, value } : undefined;
      },
      set: (name, value) => {
        cookieStore.set(name, value);
      },
      delete: (name) => {
        cookieStore.delete(name);
      },
    }),
    headers: async () => new Map(),
  };
});

// Minimal ResizeObserver mock for components that rely on it
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = function ResizeObserver() {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  };
}
