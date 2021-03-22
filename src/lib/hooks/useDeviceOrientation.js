import { useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { isPortrait } from '../utils/orientation'

const getOrientation = () => (isPortrait() ? 'portrait' : 'landscape')

export default () => {
  const [orientation, setOrientation] = useState(getOrientation())
  const { width, height } = useWindowDimensions()

  useEffect(() => {
    setOrientation(getOrientation())
  }, [width, height])

  return orientation
}
