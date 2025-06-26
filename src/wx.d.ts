declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: false positive
    wx: Record<string, any>
  }
}

export {}
