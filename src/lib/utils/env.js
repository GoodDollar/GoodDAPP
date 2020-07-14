// @flow

export const env = process.env.REACT_APP_ENV || 'development'

export const fixNL = envValue => (envValue || '').replace(/\\n/gm, '\n')
