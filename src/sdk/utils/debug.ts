export const DEBUG_ENABLED = 1

export function debug(...args: any[]) {
  DEBUG_ENABLED && console.log(...args)
}

export function debugGroup(...args: any[]) {
  DEBUG_ENABLED && console.group(...args)
  DEBUG_ENABLED && console.time(`${args[0]} time`)
}

export function debugGroupEnd(...args: any[]) {
  DEBUG_ENABLED && console.timeEnd(`${args[0]} time`)
  DEBUG_ENABLED && console.groupEnd()
}
