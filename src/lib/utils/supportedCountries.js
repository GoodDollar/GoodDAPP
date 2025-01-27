import { retry } from './async'

export const supportedCountries = async (supportedCountries = '', whitelist = [], account, enabled) => {
  if (enabled || whitelist?.includes(account)) {
    return true
  }
  if (!supportedCountries) {
    return false
  }
  const country = await retry(async () => (await fetch('https://get.geojs.io/v1/ip/country.json')).json(), 3, 2000)
    .then(data => data.country)
    .catch(() => false)

  return supportedCountries?.split(',')?.includes(country)
}
