import React, { useCallback } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import Config from '../../../config/config'
import GiveUpButton from '../standalone/components/GiveUpButton'
import { CustomButton } from '../../common'
import { openLink } from '../../../lib/utils/linking'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'

const ErrorButtons = ({ styles, screenProps, navigation, onRetry, reachedMax }) => {
  const { fvTypeformUrl } = Config

  const onContactSupport = useCallback(() => openLink(fvTypeformUrl), [navigation])

  return (
    <View style={styles.buttonsContainer}>
      {!reachedMax ? (
        <View>
          <CustomButton onPress={onRetry} style={styles.actionsSpace}>
            TRY AGAIN
          </CustomButton>
          <CustomButton onPress={onContactSupport} mode="outlined">
            {t`CONTACT SUPPORT`}
          </CustomButton>
        </View>
      ) : (
        <GiveUpButton navigation={navigation} />
      )}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    buttonsContainer: {
      width: '100%',
    },
    actionsSpace: {
      marginBottom: getDesignRelativeHeight(16),
    },
  }
}

export default withStyles(getStylesFromProps)(ErrorButtons)
