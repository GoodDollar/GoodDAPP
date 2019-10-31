import logger from '../logger/pino-logger'

const log = logger.child({ from: 'Cache' })
const SHARED_DATA_ENDPOINT = '/logindata'

export const saveDataToCache = async data => {
  await fetch(SHARED_DATA_ENDPOINT, { method: 'POST', body: JSON.stringify(data) }).then(() => {
    log.info('saved to cache')
  })
}

export const fetchDataFromCache = () => {
  return fetch(SHARED_DATA_ENDPOINT).then(response => response.json())
}
