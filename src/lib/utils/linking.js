import { Linking } from 'react-native-web'

const schemeRe = /(.+?:)\/\//

export const openLink = async uri => {
  const isSchemeSupported = await Linking.canOpenURL(uri)

  if (!isSchemeSupported) {
    const [, scheme] = schemeRe.exec(uri)

    throw new Error(`There aren't apps installed can handle '${scheme}' scheme`)
  }

  return Linking.openURL(uri)
}
