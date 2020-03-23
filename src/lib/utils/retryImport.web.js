// @flow
import retry from './retry'

const retryImport = fn => retry(fn)

export default retryImport
