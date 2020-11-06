import { isFunction, range } from 'lodash'
import { useEffect, useMemo, useRef } from 'react'

export default props => {
  const propsRef = useRef(props)

  useEffect(() => void (propsRef.current = props), props)

  return useMemo(
    () =>
      range(0, propsRef.current.length).map(index => (...args) => {
        const propValue = propsRef.current[index]

        return isFunction(propValue) ? propValue(...args) : propValue
      }),
    [],
  )
}
