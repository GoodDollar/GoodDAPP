//@flow

// libraries
import React from 'react'
import { View } from 'react-native'

// custom components
// import Text from '../view/Text'

import { store } from '../../../lib/undux/SimpleStore'
import { showDialogWithData } from '../../../lib/undux/utils/dialog'

// utils
import { withStyles } from '../../../lib/styles'

// assets
// import ClaimQueueSVG from '../../../assets/Claim/claimQueue.svg'
// import { isMobileNative } from '../../../lib/utils/platform'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'

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

export const showQueueDialog = (
  ContentComponent,
  setDialogBlur,
  { imageSource, imageHeight, imageProps = {}, buttonText, ...dialogOptions } = {},
) => {
  const imageStyle = {
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(15),
    width: '100%',
    height: getDesignRelativeHeight(129, false),
    alignItems: 'center',
  }
  const StylesWrappedContent = withStyles(styles)(ContentComponent)
  const Image = imageSource

  showDialogWithData(store.getCurrentSnapshot(), setDialogBlur, {
    type: 'queue',
    isMinHeight: true,
    image: (
      <View style={imageStyle}>
        <Image {...imageProps} />
      </View>
    ),
    message: <StylesWrappedContent />,
    buttons: [
      {
        text: buttonText || 'OK, GOT IT',
        textStyle: { fontWeight: '500' },
      },
    ],
    ...dialogOptions,
  })
}
