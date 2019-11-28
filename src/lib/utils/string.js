// @flow
export const isBase64 = str => {
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}
