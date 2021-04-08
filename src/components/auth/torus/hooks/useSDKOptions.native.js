import { useEffect } from 'react'
import { noop } from 'lodash'

export default (onOptions = noop) => {
  useEffect(() => {
    onOptions({ uxMode: 'popup' })
  }, [])
}
