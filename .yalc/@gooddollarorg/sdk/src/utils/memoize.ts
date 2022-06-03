export {}
/**
 * Clear cache with delay.
 * @param {MemoizedFunction} memoize Memoize function.
 * @param {number} delay Delay of cache clear.
 * @returns {void}
 */
export function delayedCacheClear(memoize: any, delay = 1000): void {
  setTimeout(() => memoize.cache.clear(), delay)
}

/**
 * Clear cache.
 * @param {MemoizedFunction} memoize Memoize function.
 * @returns {void}
 */
export function cacheClear(memoize: any): void {
  memoize.cache.clear()
}

