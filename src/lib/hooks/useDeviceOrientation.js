import { useEffect, useState } from 'react'
import { isPortrait } from '../utils/orientation'
import useWindowDimensions from './useWindowDimensions'

const getOrientation = () => (isPortrait() ? 'portrait' : 'landscape')

export default () => {
  const [orientation, setOrientation] = useState(getOrientation())
  const { width, height } = useWindowDimensions()

  useEffect(() => {
    setOrientation(getOrientation())
  }, [width, height])

  return orientation
}
