// @flow
import React from 'react'
import retry from './retry'

const lazy = fn => {
  return React.lazy(() => retry(fn))
}

export default lazy
