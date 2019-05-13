// @flow
import { isMobile } from 'mobile-device-detect'
import React, { useCallback } from 'react'
import { Clipboard } from 'react-native'

import logger from '../../lib/logger/pino-logger'
import { CustomButton as Button } from '../common'

const log = logger.child({ from: 'ShareLink' })

type Props = {
  children: any,
  link: string,
  props: any
}

const ShareLink = ({ children, link, ...props }: Props) => {
  const share = useCallback(() => {
    if (isMobile) {
      navigator.send({
        title: 'Sending GD via Good Dollar App',
        text: 'To send me GD open:',
        url: link
      })
    } else {
      Clipboard.setString(link)
      log.info('Receive link copied', { link })
    }
  })

  return (
    <Button mode="contained" dark={true} onPress={share} {...props}>
      {children}
    </Button>
  )
}

export default ShareLink
