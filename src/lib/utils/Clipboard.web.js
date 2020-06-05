// @flow
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'Clipboard' })

export default new class {
  constructor(api) {
    this.api
  }

  async getString(): Promise<string> {
    const { api } = this
    const text = await api.readText()

    log.debug('getString', text)
    return text
  }

  async setString(text: string): Promise<void> {
    const { api } = this

    await api.writeText(text)
    log.debug('setString', text)
  }
}(navigator.clipboard)
