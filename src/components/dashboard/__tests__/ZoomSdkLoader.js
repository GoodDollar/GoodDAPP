import { ZoomSdkLoader } from '../FaceRecognition/ZoomSdkLoader'

let zoomChecker

afterAll(() => {
  clearTimeout(zoomChecker)
})

describe('ZoomSdkLoader Functionality', () => {
  it('loads zoom successfuly', () => {
    let loadedZoom = ZoomSdkLoader.load()
    expect(loadedZoom).toBeDefined()
    zoomChecker = setTimeout(function() {
      expect(window.ZoomSDK).toBeDefined()
      expect(exports.ZoomSDK).toBeDefined()
      expect(ZoomSdkLoader.ZoomSDK).toBeDefined()
    }, 500)
  })
  it('unloads zoom successfuly', () => {
    let loadedZoom = ZoomSdkLoader.load()
    zoomChecker = setTimeout(function() {
      ZoomSdkLoader.unload()
      expect(loadedZoom).not.toBeDefined()
      expect(window.ZoomSDK).not.toBeDefined()
      expect(exports.ZoomSDK).not.toBeDefined()
      expect(ZoomSdkLoader.ZoomSDK).not.toBeDefined()
    }, 500)
  })
})
