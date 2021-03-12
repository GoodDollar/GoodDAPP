import { memoize } from 'lodash'

export const getSVGAspectRatio = memoize(SvgImage => {
  // getting width and height of svg
  const { viewBox } = SvgImage().props
  const [, , width, height] = viewBox.split(' ').map(Number)

  // calculate aspect ratio for svg wrapper
  return width / height
})
