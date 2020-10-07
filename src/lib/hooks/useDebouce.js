import { useEffect, useState } from 'react'

const defaultDelay = 500

export const useDebounce = (value, delay = defaultDelay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
