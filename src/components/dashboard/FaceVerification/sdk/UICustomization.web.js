import hexToRgba from 'hex-to-rgba'
import { isString, mapKeys, memoize, pickBy, snakeCase } from 'lodash'

import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'

import { theme } from '../../../theme/styles'
import './UICustomization.css'

export const ZOOM_PUBLIC_PATH = '/zoom'

const { ZoomCustomization, ZoomCancelButtonLocation } = ZoomAuthentication.ZoomSDK

const ZoomImage = filename => `${ZOOM_PUBLIC_PATH}/images/${filename}`
const ZoomColor = memoize(hexToRgba)
const ZoomFont = family => `'${family}', sans-serif`
const ZoomWideTextSpacing = '30px'
const ZoomDefaultCorderRadius = '5px'

const { primary, green, white, darkGray, lightBlue800 } = theme.colors
const { default: defaultFont } = theme.fonts

export const UITextStrings = {
  zoomInitializingCamera: '', // passing empty string to remove "Initializing Camera message"
  zoomResultSuccessMessage: 'You are an<br>amazing unicorn!',
  zoomResultFacemapUploadMessage: "Verifying you're<br>one of a kind",
  zoomResultIdscanUploadMessage: "Verifying you're<br>one of a kind",

  toJSON() {
    return mapKeys(pickBy(this, isString), (_, i18nString) => snakeCase(i18nString))
  },
}

export const UICustomization = new ZoomCustomization({
  // disabling camera permissions help screen
  // (as we have own ErrorScreen with corresponding message)
  enableCameraPermissionsHelpScreen: false,

  // setting custom location & image of cancel button
  cancelButtonCustomization: {
    location: ZoomCancelButtonLocation.Custom,
    customImage: ZoomImage('zoom_cancel.svg'),
  },

  // removing branding image from overlay
  overlayCustomization: {
    showBrandingImage: false,
  },

  // configuring feedback bar typography & border radius
  feedbackCustomization: {
    backgroundColor: ZoomColor(primary),
    cornerRadius: ZoomDefaultCorderRadius,
    textColor: ZoomColor(white),
    textFont: ZoomFont(defaultFont),
    textSize: '24px',
    textSpacing: ZoomWideTextSpacing,
  },

  // setting oval border color & width
  ovalCustomization: {
    strokeColor: ZoomColor(primary),
    strokeWidth: 6,
    progressColor1: ZoomColor(green),
    progressColor2: ZoomColor(green),
  },

  // frame (zoom's popup) customizations
  frameCustomization: {
    // setting frame border, radius & shadow
    borderColor: 'rgba(255, 255, 255, 0)',
    borderCornerRadius: ZoomDefaultCorderRadius,
    borderWidth: '0',
    shadow: '0px 19px 38px 0px rgba(0, 0, 0, .42)',

    // setting Zoom UI background color
    backgroundColor: ZoomColor(white),
  },

  // customizing 'Camera initializing' loaind indicator to look like the ours one
  initialLoadingAnimationCustomization: {
    backgroundColor: ZoomColor(white),
    foregroundColor: ZoomColor(lightBlue800 || primary),
  },

  // guidance screens ("frame your face", "retry" etc) customizations
  guidanceCustomization: {
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
    enableRetryScreenSlideShowShuffle: false,
    retryScreenOvalStrokeColor: ZoomColor(primary),
    retryScreenImageBorderColor: ZoomColor(primary),
    retryScreenImageBorderWidth: '4px',
    retryScreenImageCornerRadius: ZoomDefaultCorderRadius,
  },

  // customizing result screen - progress bar & success animation
  resultScreenCustomization: {
    messageFont: ZoomFont('Roboto'),
    showUploadProgressBar: true,
    uploadProgressFillColor: ZoomColor(primary),
    uploadProgressTrackColor: ZoomColor('#EEEEEE'),
    resultAnimationBackgroundColor: ZoomColor(white),
    resultAnimationForegroundColor: ZoomColor(primary),
    customActivityIndicatorImage: ZoomImage('zoom_activity_indicator.gif'),
  },
})

const { cancelButtonCustomization } = UICustomization

// showing cancel button at 8px from the top and side edges)
// as ZoomRect isn't exported, we couldn't pass position & size via config object
// so, we're calling setCustomLocation() on pre-preated customization's instance
cancelButtonCustomization.setCustomLocation(8, 8, 20, 20)

export default UICustomization
