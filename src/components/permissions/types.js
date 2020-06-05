// @flow

export const Permissions = Object.freeze({
  CAMERA: 'camera',
  CLIPBOARD_WRITE: 'clipboard-write',
})

export const PermissionStatuses = Object.freeze({
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'propmt',
  UNDETERMINED: 'undetermined',
})

export type Permission = $Values<typeof Permissions>
export type PermissionStatus = $Values<typeof PermissionStatuses>
