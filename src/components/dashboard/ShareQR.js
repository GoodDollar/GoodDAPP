import React, { useCallback } from 'react'

import logger from '../../lib/logger/pino-logger'
import { CustomButton as Button } from '../common'

const log = logger.child({ from: 'Share QR' })

const ShareQR = ({ children, ...props }) => {
  const shareAddressAndQR = useCallback(() => log.warn('share action not yet available'))

  return (
    <Button mode="contained" dark={true} onPress={shareAddressAndQR} {...props}>
      {children}
    </Button>
  )
}

export default ShareQR
