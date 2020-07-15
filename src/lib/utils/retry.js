import { delay } from './async'

const retry = (fn, retriesLeft = 5, interval = 1000) => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch(async error => {
        if (retriesLeft === 1) {
          return reject(error)
        }
        await delay(interval)
        return retry(fn, retriesLeft - 1, interval)
      })
  })
}

export default retry
