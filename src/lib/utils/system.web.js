import { retry } from './async'

export const restart = (fromUrl = null) => {
  const { location } = window

  if (!fromUrl) {
    location.reload(true)
    return
  }

  location.replace(fromUrl)
}

export const retryImport = fn => retry(fn, 5, 1000)

export const exitApp = () => window.close()
