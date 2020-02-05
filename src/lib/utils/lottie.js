import { Platform } from 'react-native'
import { isMobileReactNative } from './platform'

export const fixAssets = (assets, animationName) => {
  if (!(assets && Array.isArray(assets)) || !isMobileReactNative) {
    return assets
  }

  return assets.map(asset => {
    if (!asset.p) {
      return asset
    }

    asset.p = Platform.select({
      ios: asset.p.replace('img', animationName),
      web: asset.p.replace('png', 'svg'),
      android: asset.p,
    })

    asset.u = Platform.select({
      ios: '',
    })
    return asset
  })
}
export const getAnimationData = (animationName, animationData) => {
  animationData.assets = fixAssets(animationData.assets, animationName)
  return {
    animationData,
    imageAssetsFolder: `animations/${animationName}`,
  }
}
