// @flow
import { noop } from 'lodash'
import { retry } from './async'

const retryImport = fn =>
  retry(fn, 5, 1000).catch(e => {
    const { name, message } = e

    if ('SyntaxError' !== name || !message.startsWith('Unexpected token <')) {
      throw e
    }

    return new Promise(noop)
  })

export default retryImport
