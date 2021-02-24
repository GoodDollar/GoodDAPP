// @flow
export { noop as onAppUpdated } from 'lodash'

const retryImport = fn => fn()

export default retryImport
