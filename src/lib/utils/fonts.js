import { capitalize, invert, memoize } from 'lodash'
import { isMobileNative } from './platform'

const FONT_WEIGHTS = {
  extralight: '100',
  thin: '200',
  book: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
  fat: '900',
}

const defaultFontWeight = 'regular'
const defaultFontFamily = 'Roboto'
const robotoSlabRegex = /(Roboto)\s+([A-Z])/
const invertedFontWeights = invert(FONT_WEIGHTS)

/**
 * Returns the proper value to apply for the fontWeight prop based on values provided in wireframes
 * @param {string} fontWeight - defaults to 'regular'
 * {
 *   extralight: 100,
 *   thin: 200,
 *   book: 300,
 *   regular: 400,
 *   medium: 500,
 *   semibold: 600,
 *   bold: 700,
 *   black: 800,
 *   fat: 900
 * }
 * @returns {string}
 */
export const calculateFontWeight = (fontWeight = defaultFontWeight) => {
  if (fontWeight === defaultFontWeight || !(fontWeight in FONT_WEIGHTS)) {
    return 'normal'
  }

  return FONT_WEIGHTS[fontWeight]
}

/**
 * Returns a proper branded font family name for current platform
 * Example: for the Roboto Slab font it returns 'Roboto Slab' on Web or iIOS but 'RobotoSlab' on Android
 *
 * @param {String} fontFamily
 * @returns {String}
 */
export const getPlatformFontFamily = memoize(fontFamily => {
  const family = fontFamily || defaultFontFamily

  if (isMobileNative && robotoSlabRegex.test(family)) {
    return family.replace(robotoSlabRegex, '$1$2')
  }

  return family
})

/**
 * Returns a proper font family name suffixed with the font weight (for current platform)
 * Example: for Roboto it returns 'Roboto-Regular' on native, 'Roboto' on web
 * For Roboto and 500 weight it returns 'Roboto-Medium' on native, 'Roboto' on web (weight is set on CSS)
 *
 * @param {String} fontFamily
 * @param {String|Number} fontWeight (optional)
 * @returns {String}
 */

export const calculateFontFamily = memoize(
  (fontFamily, fontWeight = null) => {
    const calculatedFamily = getPlatformFontFamily(fontFamily)

    if (isMobileNative) {
      const [fontFamily] = calculatedFamily.split('-')
      // check if fontWeight is not NAN before we search in the invertedFontWeights
      const fontWeightSuffix = isNaN(fontWeight) ? fontWeight : invertedFontWeights[fontWeight]
      const calculatedWeight = fontWeightSuffix || defaultFontWeight

      return `${fontFamily}-${capitalize(calculatedWeight)}`
    }

    return calculatedFamily
  },
  (fontFamily, fontWeight) => (fontWeight ? fontFamily + String(fontWeight) : fontFamily),
)
