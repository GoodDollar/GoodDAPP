// @flow
import { isMobile } from 'mobile-device-detect'
import React, { useCallback } from 'react'
import { Clipboard } from 'react-native'

import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import { CustomButton as Button } from '../common'

const log = logger.child({ from: 'ShareLink' })

type Props = {
  children: any,
  link: string,
  props: any
}

const ShareLink = ({ children, link, ...props }: Props) => {
  const [showDialogWithData] = useDialog()

  const share = useCallback(async () => {
    if (isMobile) {
      try {
        await navigator.share({
          title: 'Sending GD via Good Dollar App',
          text: 'To send me GD open:',
          url: link
        })
      } catch (e) {
        showDialogWithData({
          title: 'Error',
          message:
            'There was a problem triggering share action. URL will be copied to clipboard after closing this dialog',
          dismissText: 'Ok',
          onDismiss: () => Clipboard.setString(link)
        })
      }
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
