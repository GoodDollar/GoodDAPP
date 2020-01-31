import { Platform } from 'react-native'
import { isMobileReactNative } from './platform'

export const fixAssets = (assets, animationName) => {
  if (!(assets && Array.isArray(assets)) || !isMobileReactNative) {
    return assets
  }
  return assets.map(asset => {
    asset.p = Platform.select({
      ios: asset.p.replace('svg', 'png').replace('img', animationName),
      android: asset.p.replace('svg', 'png'),
    })
    asset.u = Platform.select({
      ios: '',
      android: '',
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
