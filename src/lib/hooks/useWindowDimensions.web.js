import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'
import { getScreenHeight, getScreenWidth } from '../utils/orientation'

const getCurrentDimensions = () => ({
  height: getScreenHeight(),
  width: getScreenWidth(),
})

export default () => {
  const [dimensions, setDimensions] = useState(getCurrentDimensions())

  useEffect(() => {
    const listener = () => setDimensions(getCurrentDimensions())
    const subscription = Dimensions.addEventListener('change', listener)

    return () => subscription.remove()
  }, [])

  return dimensions
}
