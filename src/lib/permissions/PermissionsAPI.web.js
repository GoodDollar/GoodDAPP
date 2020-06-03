class PermissionsAPIWeb {
  async getCameraPermissionStatus() {
    // Fetching the list of input/output media devices
    const listOfMediaDevices = navigator.mediaDevices ? await navigator.mediaDevices.enumerateDevices : []

    // Search for video input device (i.e. camera)
    const videoDevice = listOfMediaDevices.find(device => device.kind === 'videoinput') || {}

    // if label field is not empty or null - it means camera access is granted
    // so returning label field as boolean value
    return Boolean(videoDevice.label)
  }

  async getClipboardPermissionStatus() {
    try {
      // trying to read data from clipboard
      await navigator.clipboard.read()
    } catch (e) {
      // if clipboard access is denied then NotAllowedError will occur
      if (e.name === 'NotAllowedError') {
        return false
      }
    }

    // in case error did not appear - clipboard access granted
    return true
  }
}

export default new PermissionsAPIWeb()
