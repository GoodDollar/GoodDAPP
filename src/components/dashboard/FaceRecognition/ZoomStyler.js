// @flow
import logger from '../../../lib/logger/pino-logger'

/**
 * Styles Zoom SDK
 */
const log = logger.child({ from: 'ZoomStyler' })

export const styleZoom = (zoomSDK: any) => {
  log.debug('Styling Zoom..')
  var zoomCustomization = new zoomSDK.ZoomCustomization()

  // Apply the specified customization parameters for ZoOm
  zoomSDK.setCustomization(zoomCustomization)
}
