// @flow
import Clipboard from '@react-native-community/clipboard'
import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'Clipboard' })

export default new (class {
  constructor(api) {
    this.api = api
  }

  async getString(): Promise<string> {
    const { api } = this
    const text = await api.getString()

    log.debug('getString', text)
    return text
  }

  // making it async to keep consistence with web ClipboardAPI
  // eslint-disable-next-line require-await
  async setString(text: string): Promise<void> {
    const { api } = this

    log.debug('setString', text)
    api.setString(text)
  }
})(Clipboard)
