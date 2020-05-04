// @flow
import { Linking } from 'react-native'

const schemeRe = /(.+?:)\/\//

const openURL = async (uri: string, target?: '_blank' | '_self' = '_blank', noopener?: boolean = false) => {
  const isSchemeSupported = await Linking.canOpenURL(uri)

  if (!isSchemeSupported) {
    const [, scheme] = schemeRe.exec(uri)

    throw new Error(`There aren't apps installed can handle '${scheme}' scheme`)
  }
  const args = [new URL(uri, window.location).toString(), target]

  if (noopener) {
    args.push('noopener')
  }

  window.open(...args)
  return Linking.openURL(uri)
}

export default { ...Linking, openURL }
