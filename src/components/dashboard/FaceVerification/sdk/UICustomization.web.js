import hexToRgba from 'hex-to-rgba'
import { Colors } from 'react-native-paper'
import { assignIn, get, isFinite, isString, mapKeys, memoize, pickBy, snakeCase } from 'lodash'

import FaceTec from '../../../../lib/facetec/FaceTecSDK'

import { resultFacescanUploadMessage, resultSuccessMessage } from '../sdk/FaceTecSDK.constants'
import { isLargeDevice } from '../../../../lib/utils/sizes'
import { theme } from '../../../theme/styles'
import './UICustomization.css'

export const FACETEC_PUBLIC_PATH = '/facetec'
export const FACETEC_NS = 'FaceTec'

const { FaceTecSDK } = FaceTec
const { FaceTecCustomization, FaceTecCancelButtonLocation } = FaceTecSDK

// there's bug in SDK - FaceTecVocalGuidanceMode isn't exported
// added fallback to polyfill it
const FaceTecVocalGuidanceMode = get(FaceTecSDK, 'FaceTecVocalGuidanceMode', {
  MINIMAL_VOCAL_GUIDANCE: 0,
  FULL_VOCAL_GUIDANCE: 1,
  NO_VOCAL_GUIDANCE: 2,
})

const FaceTecShadow = (box, color, alpha) => `${box.map(FaceTecSize).join(' ')} ${FaceTecColor(color, alpha)}`
const FaceTecImage = filename => `${FACETEC_PUBLIC_PATH}/images/${FACETEC_NS}_${filename}`
const FaceTecFont = family => `'${family}', sans-serif`
const FaceTecSize = size => (size ? `${size}px` : '0')

const FaceTecColor = memoize(hexToRgba, (color, alpha) => {
  let cacheKey = color

  if ((isFinite(alpha) || isString(alpha)) && isString(color)) {
    cacheKey += String(alpha)
  }

  return cacheKey
})

const FaceTecDefaultCornerRadius = FaceTecSize(5)

const { black, lightBlue800 } = Colors
const { primary, green, white, lightGray, darkGray, gray50Percent } = theme.colors
const { default: defaultFont } = theme.fonts

const readyMessage1 = `Please Frame Your Face In The Small`
const readyMessage2 = `Oval, Then The Big Oval`
const instructionsMessageReadyDesktop = `${readyMessage1} ${readyMessage2}`

export const UITextStrings = {
  resultSuccessMessage,
  resultFacescanUploadMessage,

  retryInstructionMessage1: `
    <span>
      Hold Your Camera at Eye Level.<br/>
      Light Your Face Evenly.<br/>
      Avoid Smiling & Back Light<br />
    </span>
`,

  retryInstructionMessage2: '',
  retryInstructionMessage3: '',

  instructionsMessageReadyDesktop,
  instructionsMessageReady1Mobile: isLargeDevice ? instructionsMessageReadyDesktop : readyMessage1,
  instructionsMessageReady2Mobile: isLargeDevice ? '' : readyMessage2,

  // setting empty "Starting camera..." text
  initializingCamera: ' ',
  initializingCameraStillLoading: ' ',

  toJSON() {
    return mapKeys(pickBy(this, isString), (_, i18nString) => `${FACETEC_NS}_${snakeCase(i18nString)}`)
  },
}

export const createBasicUICustomization = () => {
  const UICustomization = new FaceTecCustomization()

  const {
    cancelButtonCustomization,
    overlayCustomization,
    feedbackCustomization,
    ovalCustomization,
    frameCustomization,
    initialLoadingAnimationCustomization,
    guidanceCustomization,
    resultScreenCustomization,
    vocalGuidanceCustomization,
  } = UICustomization

  assignIn(UICustomization, {
    // disabling camera permissions help screen
    // (as we have own ErrorScreen with corresponding message)
    enableCameraPermissionsHelpScreen: false,

    // making Zoom a bit tolerant to the user actions during verification
    // now any keyboard / focus event won't cancel session due to the context switch
    // the session should cancels only when app/browser tab switched
    enableHotKeyProtection: false,

    // For non-production instances, display the clickable Development Mode Tag link during the Result Screen.
    enableDevelopmentModeTag: false,
  })

  // Zoom's spinner is rendered via CSS border
  // Setting the same background & foreground color to hide it
  // Default Zoom's animation is disabled in UICustomization.css
  assignIn(initialLoadingAnimationCustomization, {
    foregroundColor: FaceTecColor(lightBlue800),
    backgroundColor: FaceTecColor(white),
  })

  // removing branding image from overlay
  assignIn(overlayCustomization, {
    showBrandingImage: false,
    backgroundColor: FaceTecColor(white, 0.5),
  })

  // setting custom location & image of cancel button
  assignIn(cancelButtonCustomization, {
    location: FaceTecCancelButtonLocation.TopRight,
    customImage: FaceTecImage('cancel.svg'),
  })

  // configuring feedback bar typography & border radius
  // bold font style is set in UICustomization.css
  assignIn(feedbackCustomization, {
    backgroundColor: FaceTecColor(primary),
    cornerRadius: FaceTecDefaultCornerRadius,
    textColor: FaceTecColor(white),
    textFont: FaceTecFont(defaultFont),
  })

  // setting oval border color & width
  assignIn(ovalCustomization, {
    strokeColor: FaceTecColor(primary),
    strokeWidth: 6,
    progressColor1: FaceTecColor(green),
    progressColor2: FaceTecColor(green),
  })

  // frame (zoom's popup) customizations
  assignIn(frameCustomization, {
    // setting frame border, radius & shadow
    borderColor: FaceTecColor(white, 0),
    borderCornerRadius: FaceTecDefaultCornerRadius,
    borderWidth: FaceTecSize(0),
    shadow: FaceTecShadow([0, 19, 38, 0], black, 0.42),

    // setting Zoom UI background color
    backgroundColor: FaceTecColor(white),
  })

  // guidance screens ("frame your face", "retry" etc) customizations
  assignIn(guidanceCustomization, {
    // setting setting Zoom UI default text color
    foregroundColor: FaceTecColor(darkGray),

    // customizing buttons
    buttonFont: FaceTecFont(defaultFont),
    buttonBorderWidth: FaceTecSize(0),
    buttonCornerRadius: FaceTecDefaultCornerRadius,
    buttonTextNormalColor: FaceTecColor(white),
    buttonTextHighlightColor: FaceTecColor(white),
    buttonTextDisabledColor: FaceTecColor(white),
    buttonBackgroundNormalColor: FaceTecColor(primary),
    buttonBackgroundHighlightColor: FaceTecColor(green),
    buttonBackgroundDisabledColor: FaceTecColor(gray50Percent),

    // customizing header / subtext
    // medium font style is set in UICustomization.css
    headerFont: FaceTecFont(defaultFont),

    // subtext
    subtextFont: FaceTecFont(defaultFont),

    // enabling additional instructions on retry screen
    enableRetryScreenBulletedInstructions: true,

    // configuring guidance images on retry screen
    retryScreenOvalStrokeColor: FaceTecColor(primary),
    retryScreenImageBorderColor: FaceTecColor(primary),
    retryScreenImageBorderWidth: FaceTecSize(4),
    retryScreenImageCornerRadius: FaceTecDefaultCornerRadius,
  })

  // customizing result screen - progress bar & success animation
  assignIn(resultScreenCustomization, {
    foregroundColor: FaceTecColor(darkGray),
    messageFont: FaceTecFont(defaultFont),
    showUploadProgressBar: true,
    uploadProgressFillColor: FaceTecColor(primary),
    uploadProgressTrackColor: FaceTecColor(lightGray),
    resultAnimationBackgroundColor: FaceTecColor(white),
    resultAnimationForegroundColor: FaceTecColor(primary),
    customActivityIndicatorImage: FaceTecImage('activity_indicator.gif'),
    customActivityIndicatorRotationInterval: 0,
  })

  // voice help customization
  assignIn(vocalGuidanceCustomization, {
    // disable audio guidance
    mode: FaceTecVocalGuidanceMode.NO_VOCAL_GUIDANCE,
  })

  return UICustomization
}

const NormalUICustomization = createBasicUICustomization()

const LowLightModeUICustomization = createBasicUICustomization()

const DynamicModeUICustomization = createBasicUICustomization()

assignIn(DynamicModeUICustomization.cancelButtonCustomization, {
  customImage: FaceTecImage('cancel_white.svg'),
})

assignIn(DynamicModeUICustomization.guidanceCustomization, {
  readyScreenHeaderTextColor: FaceTecColor(white),
  readyScreenSubtextTextColor: FaceTecColor(white),
})

export { NormalUICustomization, LowLightModeUICustomization, DynamicModeUICustomization }
