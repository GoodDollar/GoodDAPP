// @flow

// clipboard-copy relies on document.execCommand which is deprecated and likely does not work on newer devices
import writeTextOld from 'clipboard-copy'
import { bindKey } from 'lodash'

import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'Clipboard' })
const readText = bindKey(navigator.clipboard, 'readText')
const writeText = navigator && navigator.clipboard ? bindKey(navigator.clipboard, 'writeText') : writeTextOld

export default new class {
  constructor(api) {
    this.api = api
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
}({ readText, writeText })
