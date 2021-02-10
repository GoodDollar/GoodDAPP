// @flow
import { retry } from './async'
import restart from './restart'

const retryImport = fn => retry(fn, 5, 1000).catch(() => restart())

export default retryImport
