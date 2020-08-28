// @flow

export const env = env => env || 'development'

export const fixNL = envValue => (envValue || '').replace(/\\n/gm, '\n')
