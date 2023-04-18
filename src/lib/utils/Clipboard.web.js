// @flow

// clipboard-copy relies on document.execCommand which is deprecated and likely does not work on newer devices
import writeText from 'clipboard-copy'
import { assign, isFunction } from 'lodash'

import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'Clipboard' })

export default new class {
  constructor(api, fallbackApi) {
    assign(this, { api, fallbackApi })
  }

  async getString(): Promise<string> {
    const { api } = this
    const text = await api.readText()

    log.debug('getString', text)
    return text
  }

  async setString(text: string): Promise<void> {
    const { api, fallbackApi } = this
    const rwApi = isFunction(api.writeText) ? api : fallbackApi

    await rwApi.writeText(text)
    log.debug('setString', text)
  }
}(navigator.clipboard, { writeText })
