import React from 'react'
import ReactDOM from 'react-dom'
import hexToRgba from 'hex-to-rgba'
import { assignIn, isString, mapKeys, memoize, pickBy, snakeCase } from 'lodash'

import { Spinner } from '../../../common/view/LoadingIndicator'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'

import { zoomResultSuccessMessage } from '../utils/strings'
import { isLargeDevice } from '../../../../lib/utils/mobileSizeDetect'
import { theme } from '../../../theme/styles'
import './UICustomization.css'

export const ZOOM_PUBLIC_PATH = '/zoom'

const { ZoomCustomization, ZoomCancelButtonLocation } = ZoomAuthentication.ZoomSDK

const ZoomImage = filename => `${ZOOM_PUBLIC_PATH}/images/${filename}`
const ZoomColor = memoize(hexToRgba)
const ZoomFont = family => `'${family}', sans-serif`

const ZoomHeaderTextSize = '22px'
const ZoomDefaultCorderRadius = '5px'

const { primary, green, white, lightGray, darkGray, gray50Percent } = theme.colors
const { default: defaultFont } = theme.fonts
const nl = isLargeDevice ? ' ' : '<br/>'

export const UITextStrings = {
  zoomResultSuccessMessage,
  zoomRetryInstructionMessage1: '<span>Hold Your Camera at Eye Level.</span>',
  zoomRetryInstructionMessage2: '<span>Light Your Face Evenly.<br/>Avoid Smiling & Back Light</span>',

  zoomInstructionsMessageReady: `Please Frame Your Face${nl}In The Small Oval,${nl}Then The Big Oval`,

  zoomInitializingCamera: null, // setting empty "Starting camera..." text
  zoomResultFacemapUploadMessage: `Verifying you're\none of a kind`,
  zoomResultIdscanUploadMessage: `Verifying you're\none of a kind`,

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

const { element } = initialLoadingAnimationCustomization

assignIn(UICustomization, {
  // disabling camera permissions help screen
  // (as we have own ErrorScreen with corresponding message)
  enableCameraPermissionsHelpScreen: false,

  // making Zoom a bit tolerant to the user actions during verification
  // now any keyboard / focus event won't cancel session due to the context switch
  // the session should cancels only when app/browser tab switched
  enableHotKeyProtection: false,
})

// customizing 'Camera initializing' indicator
// rendering our animated loading spinner inside Zoom's spinner
ReactDOM.render(<Spinner loading />, element)

// Zoom's spinner is rendered via CSS border
// Setting the same background & foreground color to hide it
// Default Zoom's animation is disabled in UICustomization.css
assignIn(initialLoadingAnimationCustomization, {
  foregroundColor: ZoomColor(white),
  backgroundColor: ZoomColor(white),
})

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
// bold font style is set in UICustomization.css
assignIn(feedbackCustomization, {
  backgroundColor: ZoomColor(primary),
  cornerRadius: ZoomDefaultCorderRadius,
  textColor: ZoomColor(white),
  textFont: ZoomFont(defaultFont),
  textSize: '24px',
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
  buttonBackgroundNormalColor: ZoomColor(primary),
  buttonBackgroundHighlightColor: ZoomColor(green),
  buttonBackgroundDisabledColor: ZoomColor(gray50Percent),

  // customizing header / subtext
  // medium font style is set in UICustomization.css
  headerFont: ZoomFont(defaultFont),
  headerTextSize: ZoomHeaderTextSize,

  // subtext
  subtextFont: ZoomFont(defaultFont),
  subtextTextSize: '12px',

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
  foregroundColor: ZoomColor(darkGray),
  messageFont: ZoomFont(defaultFont),
  messageTextSpacing: '0.08px',
  messageTextSize: '16px',
  showUploadProgressBar: true,
  uploadProgressFillColor: ZoomColor(primary),
  uploadProgressTrackColor: ZoomColor(lightGray),
  resultAnimationBackgroundColor: ZoomColor(white),
  resultAnimationForegroundColor: ZoomColor(primary),
  customActivityIndicatorImage: ZoomImage('zoom_activity_indicator.gif'),
})

export default UICustomization
