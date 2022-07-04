// @flow

export const Permissions = Object.freeze({
  Camera: 'camera',
  Clipboard: 'clipboard',
  Notifications: 'notifications',
})

export const PermissionStatuses = Object.freeze({
  Granted: 'granted',
  Denied: 'denied',
  Prompt: 'prompt',
  Disabled: 'disabled',
  Undetermined: 'undetermined',
})

export type Permission = $Values<typeof Permissions>
export type PermissionStatus = $Values<typeof PermissionStatuses>
