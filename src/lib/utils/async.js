import { debounce } from 'lodash'

// eslint-disable-next-line require-await
export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

export const onPressFix = cb => debounce(cb, 500, { leading: true, trailing: false })
