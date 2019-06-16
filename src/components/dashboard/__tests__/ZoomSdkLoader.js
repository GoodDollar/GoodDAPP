import zoomSdkLoader from '../FaceRecognition/ZoomSdkLoader'

let zoomChecker

afterAll(() => {
  clearTimeout(zoomChecker)
})

describe('ZoomSdkLoader Functionality', () => {
  it('loads zoom successfuly', () => {
    let loadedZoom = zoomSdkLoader.load()
    expect(loadedZoom).toBeDefined()
    zoomChecker = setTimeout(function() {
      expect(window.ZoomSDK).toBeDefined()
      expect(exports.ZoomSDK).toBeDefined()
      expect(zoomSdkLoader.ZoomSDK).toBeDefined()
    }, 500)
  })
  it('unloads zoom successfuly', () => {
    let loadedZoom = zoomSdkLoader.load()
    zoomChecker = setTimeout(function() {
      zoomSdkLoader.unload()
      expect(loadedZoom).not.toBeDefined()
      expect(window.ZoomSDK).not.toBeDefined()
      expect(exports.ZoomSDK).not.toBeDefined()
      expect(zoomSdkLoader.ZoomSDK).not.toBeDefined()
    }, 500)
  })
})
