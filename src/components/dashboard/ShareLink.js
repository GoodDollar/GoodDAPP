import React, { useCallback } from 'react'

import logger from '../../lib/logger/pino-logger'
import { CustomButton as Button } from '../common'

const log = logger.child({ from: 'ShareLink' })

const ShareLink = ({ children, ...props }) => {
  const link = props.link
  const share = useCallback(() => log.warn(link))

  return (
    <Button mode="contained" dark={true} onPress={share} {...props}>
      {children}
    </Button>
  )
}

export default ShareLink
