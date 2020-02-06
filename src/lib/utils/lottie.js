import { Platform } from 'react-native'

export const fixAssets = (assets, animationName) => {
  if (!(assets && Array.isArray(assets))) {
    return assets
  }
  return assets.map(asset => {
    asset.p = Platform.select({
      ios: asset.p.replace('img', animationName),
      android: asset.p,
      web: asset.p.replace('png', 'svg'),
    })
    asset.u = Platform.select({
      ios: '',
      android: '',
      web: asset.u,
    })
    return asset
  })
}

export const getAnimationData = (animationName, animationData) => {
  animationData.assets = fixAssets(animationData.assets, animationName)
  return {
    animationData,
    imageAssetsFolder: `animations/${animationName}/drawable-xhdpi`, //only for android. ios ignore this
  }
}
