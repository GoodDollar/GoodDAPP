import { useState } from 'react'

const usePromise = () => {
  const [promiseState] = useState(() => {
    let _resolve
    let _reject

    const promise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })

    return [promise, _resolve, _reject]
  })

  return promiseState
}

export default usePromise
