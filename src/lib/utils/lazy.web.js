// @flow
import retry from './retry'

const lazy = fn => retry(fn)

export default lazy
