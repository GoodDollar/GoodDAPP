import { retry } from './async'

export const supportedCountries = async (supportedCountries = '', whitelist = [], account) => {
  const country = await retry(
    async () => (await fetch('https://get.geojs.io/v1/ip/country.json')).json(),
    3,
    2000,
  ).then(data => data.country)

  const isEligible = supportedCountries?.split(',')?.includes(country) || whitelist?.includes(account)

  return isEligible
}
