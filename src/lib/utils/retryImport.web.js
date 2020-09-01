// @flow
import { retry } from './async'

const retryImport = fn => retry(fn, 5, 1000)

export default retryImport
