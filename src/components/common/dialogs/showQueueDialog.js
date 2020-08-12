//@flow

// libraries
import React from 'react'
import { Image } from 'react-native'

import { store } from '../../../lib/undux/SimpleStore'
import { showDialogWithData } from '../../../lib/undux/utils/dialog'

// utils
import { withStyles } from '../../../lib/styles'

// assets
import illustration from '../../../assets/Claim/claimQueue.svg'

const styles = () => ({
  wrapper: {
    flex: 1,
  },
  title: {
    borderColor: 'orange',
    borderBottomWidth: 2,
    borderTopWidth: 2,
    paddingTop: 10,
    paddingBottom: 10,
  },
  paddingTop20: {
    paddingTop: 20,
  },
  paddingVertical20: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  textStyle: {
    textAlign: 'left',
    lineHeight: 22,
  },
  boldFont: {
    fontWeight: 'bold',
  },
})

export const showQueueDialog = (ContentComponent, dialogOptions = {}) => {
  const imageStyle = { marginRight: 'auto', marginLeft: 'auto', width: '33vh', height: '28vh' }
  const StylesWrappedContent = withStyles(styles)(ContentComponent)

  showDialogWithData(store.getCurrentSnapshot(), {
    type: 'queue',
    isMinHeight: true,
    image: <Image source={illustration} style={imageStyle} resizeMode="contain" />,
    message: <StylesWrappedContent />,
    buttons: [
      {
        text: dialogOptions.buttonText || 'OK, GOT IT',
        textStyle: { fontWeight: '500' },
      },
    ],
    ...dialogOptions,
  })
}
