import { Dimensions } from 'react-native'

const { height, width } = Dimensions.get('window')

const DESIGN_WIDTH = 360
const DESIGN_HEIGHT = 640 - 24

const windowHeight = height > DESIGN_HEIGHT ? DESIGN_HEIGHT : height
const windowWidth = width > DESIGN_WIDTH ? DESIGN_WIDTH : width

const CURRENT_RESOLUTION = Math.sqrt(windowHeight * windowHeight + windowWidth * windowWidth)
const DESIGN_RESOLUTION = Math.sqrt(DESIGN_HEIGHT * DESIGN_HEIGHT + DESIGN_WIDTH * DESIGN_WIDTH)

const RESOLUTIONS_PROPORTION = CURRENT_RESOLUTION / DESIGN_RESOLUTION

export default size => {
  if (RESOLUTIONS_PROPORTION < 1 && size <= 14) {
    return size
  }

  return RESOLUTIONS_PROPORTION * size
}
