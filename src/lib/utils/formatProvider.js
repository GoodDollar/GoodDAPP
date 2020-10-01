const formatProvider = provider => {
  if (provider.includes('google')) {
    return 'Google'
  }
  if (provider.includes('auth0')) {
    return 'PasswordLess'
  }
  return provider
}

export default formatProvider
