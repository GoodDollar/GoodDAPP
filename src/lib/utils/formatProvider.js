export const formatProvider = provider => {
  switch (provider) {
    case 'facebook':
      return 'Facebook'
    case 'google':
      return 'google'
    case 'auth0-pwdless-email':
      return 'Passwordless Email'
    case 'auth0-pwdless-sms':
      return 'Passwordless SMS'
  }
  return provider || 'Other'
}
