import { upperFirst } from 'lodash'

const LoginStrategy = {
  Facebook: 'facebook',
  GoogleLegacy: 'google-old',
  Google: 'google',
  Auth0: 'auth0',
  PaswordlessEmail: 'auth0-pwdless-email',
  PaswordlessSMS: 'auth0-pwdless-sms',
}

export const formatProvider = strategy => {
  const { GoogleLegacy, PaswordlessSMS } = LoginStrategy

  if (strategy.includes('pwdless')) {
    return `Passwordless (${strategy === PaswordlessSMS ? 'SMS' : 'E-Mail'})`
  }

  return `${upperFirst(strategy)}${strategy === GoogleLegacy ? ' (legacy)' : ''}`
}
