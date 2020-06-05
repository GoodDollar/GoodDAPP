// @flow

export const Permissions = Object.freeze({
  CAMERA: 'camera',
  CLIPBOARD: 'clipboard',
})

export type Permission = $Values<typeof Permissions>
