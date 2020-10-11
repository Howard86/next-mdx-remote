if (typeof window !== 'undefined') {
  if (typeof window.requestIdleCallback === 'undefined') {
    window.requestIdleCallback = (cb) => {
      var start = Date.now()
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        })
      }, 1)
    }
  }

  if (typeof window.cancelIdleCallback === 'undefined') {
    window.cancelIdleCallback = (id) => clearTimeout(id)
  }
}
