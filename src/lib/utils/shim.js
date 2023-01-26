export const shimMethod = (object, method, implementation, force = false) => {
  if ('function' === typeof object[method] && force !== true) {
    return
  }

  Object.defineProperty(object, method, { value: implementation })
}

export const shimGlboal = (globalAPI, implementation, force = false) => {
  if ('undefined' !== typeof global[globalAPI] && force !== true) {
    return
  }

  global[globalAPI] = implementation
}
