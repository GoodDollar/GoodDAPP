// @flow

export const env = env => env || 'development'

export const fixNL = envValue => (envValue || '').replace(/\\n/gm, '\n')

export const publicUrlForEnv = env => {
  switch (env) {
    case 'development':
      return 'https://gooddev.netlify.app'
    case 'staging':
      return 'https://goodqa.netlify.app'
    case 'production':
      return 'https://wallet.gooddollar.org'
    default:
      return
  }
}
