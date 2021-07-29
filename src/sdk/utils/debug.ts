export const DEBUG_ENABLED = 0

export const debug = DEBUG_ENABLED ? console.log : (...args: any[]) => undefined // debug fn will show right line number so

export function debugGroup(...args: any[]) {
    DEBUG_ENABLED && console.group(...args)
    DEBUG_ENABLED && console.time(`${args[0]} time`)
}

export function debugGroupEnd(...args: any[]) {
    DEBUG_ENABLED && console.timeEnd(`${args[0]} time`)
    DEBUG_ENABLED && console.groupEnd()
}
