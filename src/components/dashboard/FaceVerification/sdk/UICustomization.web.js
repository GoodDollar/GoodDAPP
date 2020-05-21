import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import './UICustomization.css'

const { ZoomCustomization } = ZoomAuthentication.ZoomSDK

export const ZOOM_PUBLIC_PATH = '/zoom'

export default new ZoomCustomization({
  // disabling camera permissions help screen
  // (as we have own ErrorScreen with corresponding message)
  enableCameraPermissionsHelpScreen: false,
})
