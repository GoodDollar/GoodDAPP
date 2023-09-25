import * as idle from 'requestidlecallback'

export const requestIdle = window.requestIdleCallback || idle.request
