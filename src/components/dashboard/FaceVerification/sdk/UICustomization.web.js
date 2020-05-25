import hexToRgba from 'hex-to-rgba'
import { Colors } from 'react-native-paper'
import { assignIn, isString, mapKeys, memoize, pickBy, snakeCase } from 'lodash'

import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'

import { theme } from '../../../theme/styles'
import './UICustomization.css'

export const ZOOM_PUBLIC_PATH = '/zoom'

const { ZoomCustomization, ZoomCancelButtonLocation } = ZoomAuthentication.ZoomSDK

const ZoomImage = filename => `${ZOOM_PUBLIC_PATH}/images/${filename}`
const ZoomColor = memoize(hexToRgba)
const ZoomFont = family => `'${family}', sans-serif`

//const ZoomWideTextSpacing = '30px' looks weird, temporary disabled
const ZoomWideTextSpacing = 'normal'
const ZoomDefaultCorderRadius = '5px'

const { primary, green, white, darkGray } = theme.colors
const { default: defaultFont } = theme.fonts

export const UITextStrings = {
  zoomResultSuccessMessage: 'You are an<br>amazing unicorn!',
  zoomResultFacemapUploadMessage: "Verifying you're<br>one of a kind",
  zoomResultIdscanUploadMessage: "Verifying you're<br>one of a kind",

  toJSON() {
    return mapKeys(pickBy(this, isString), (_, i18nString) => snakeCase(i18nString))
  },
}

export const UICustomization = new ZoomCustomization()

const {
  cancelButtonCustomization,
  overlayCustomization,
  feedbackCustomization,
  ovalCustomization,
  frameCustomization,
  initialLoadingAnimationCustomization,
  guidanceCustomization,
  resultScreenCustomization,
} = UICustomization

// disabling camera permissions help screen
// (as we have own ErrorScreen with corresponding message)
UICustomization.enableCameraPermissionsHelpScreen = false

// removing branding image from overlay
assignIn(overlayCustomization, {
  showBrandingImage: false,
  backgroundColor: 'rgba(255, 255, 255, .5)',
})

// setting custom location & image of cancel button
assignIn(cancelButtonCustomization, {
  location: ZoomCancelButtonLocation.TopRight,
  customImage: ZoomImage('zoom_cancel.svg'),
})

// configuring feedback bar typography & border radius
assignIn(feedbackCustomization, {
  backgroundColor: ZoomColor(primary),
  cornerRadius: ZoomDefaultCorderRadius,
  textColor: ZoomColor(white),
  textFont: ZoomFont(defaultFont),
  textSize: '24px',
  textSpacing: ZoomWideTextSpacing,
})

// setting oval border color & width
assignIn(ovalCustomization, {
  strokeColor: ZoomColor(primary),
  strokeWidth: 6,
  progressColor1: ZoomColor(green),
  progressColor2: ZoomColor(green),
})

// frame (zoom's popup) customizations
assignIn(frameCustomization, {
  // setting frame border, radius & shadow
  borderColor: 'rgba(255, 255, 255, 0)',
  borderCornerRadius: ZoomDefaultCorderRadius,
  borderWidth: '0',
  shadow: '0px 19px 38px 0px rgba(0, 0, 0, .42)',

  // setting Zoom UI background color
  backgroundColor: ZoomColor(white),
})

// customizing 'Camera initializing' loaind indicator to look like the ours one
assignIn(initialLoadingAnimationCustomization, {
  foregroundColor: ZoomColor(Colors.lightBlue800),
  backgroundColor: ZoomColor(white),
  messageTextColor: ZoomColor(white),
})

// guidance screens ("frame your face", "retry" etc) customizations
assignIn(guidanceCustomization, {
  // setting setting Zoom UI default text color
  foregroundColor: ZoomColor(darkGray),

  // customizing buttons
  buttonFont: ZoomFont(defaultFont),
  buttonBorderWidth: '0',
  buttonCornerRadius: ZoomDefaultCorderRadius,
  buttonTextNormalColor: ZoomColor(white),
  buttonTextHighlightColor: ZoomColor(white),
  buttonTextDisabledColor: ZoomColor(white),

  // customizing header / subtext
  headerFont: ZoomFont(defaultFont),
  headerTextSize: '24px',
  headerTextSpacing: ZoomWideTextSpacing,
  subtextFont: ZoomFont(defaultFont),
  subtextTextSize: '14px',
  subtextTextSpacing: ZoomWideTextSpacing,

  // enabling additional instructions on retry screen
  enableRetryScreenBulletedInstructions: true,

  // configuring guidance images on retry screen
  enableRetryScreenSlideshowShuffle: false,
  retryScreenOvalStrokeColor: ZoomColor(primary),
  retryScreenImageBorderColor: ZoomColor(primary),
  retryScreenImageBorderWidth: '4px',
  retryScreenImageCornerRadius: ZoomDefaultCorderRadius,
})

// customizing result screen - progress bar & success animation
assignIn(resultScreenCustomization, {
  messageFont: ZoomFont('Roboto'),
  showUploadProgressBar: true,
  uploadProgressFillColor: ZoomColor(primary),
  uploadProgressTrackColor: ZoomColor('#EEEEEE'),
  resultAnimationBackgroundColor: ZoomColor(white),
  resultAnimationForegroundColor: ZoomColor(primary),
  customActivityIndicatorImage: ZoomImage('zoom_activity_indicator.gif'),
})

export default UICustomization
