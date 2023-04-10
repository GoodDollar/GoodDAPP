import { useState } from 'react'
import { makePromiseWrapper } from '../utils/async'

const usePromise = () => {
  const [promiseState] = useState(() => {
    const { promise, resolve, reject } = makePromiseWrapper()

    return [promise, resolve, reject]
  })

  return promiseState
}

export default usePromise
