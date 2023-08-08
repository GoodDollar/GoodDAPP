// libraries
import React, { useCallback, useContext } from 'react'
import { View } from 'react-native'

import { FVFlowContext } from '../context/FVFlowContext'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'
import { BlockingUnsupportedBrowser } from '../../../browserSupport/components/UnsupportedBrowser'

// utils
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import { exitApp } from '../../../../lib/utils/system'
import { openLink, redirectTo } from '../../../../lib/utils/linking'
import useCameraSupport from '../../../browserSupport/hooks/useCameraSupport'

import withStyles from '../theme/withStyles'

const DOCS_URL = 'https://doc.gooddollar/sdk/identity'
const openDocs = () => openLink(DOCS_URL, '_blank')

const BlockingUnsupportedModal = () => {
  const { unsupportedCopyUrl, rdu } = useContext(FVFlowContext)
  const navigateBack = useCallback(() => redirectTo(rdu), [rdu])
  return <BlockingUnsupportedBrowser onDismiss={navigateBack} copyUrl={unsupportedCopyUrl} />
}

const FVFlowError = ({ styles }) => {
  const { isWebView } = useContext(FVFlowContext)

  useCameraSupport({
    unsupportedPopup: BlockingUnsupportedModal,
    onCheck: () => !isWebView,
  })

  const reasonCopy = isWebView ? 'Unsupported Browser' : 'Login information is missing, for instructions please visit:'

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <Text style={styles.text}>{reasonCopy}</Text>
              {!isWebView && (
                <Text
                  color={'primary'}
                  fontSize={getDesignRelativeHeight(16)}
                  lineHeight={getDesignRelativeHeight(16)}
                  letterSpacing={0.26}
                  fontFamily="Roboto"
                  fontWeight="bold"
                  textDecorationLine="underline"
                  onPress={openDocs}
                >{`${DOCS_URL}`}</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.action}>
          <CustomButton style={styles.actionsSpace} onPress={exitApp}>
            CLOSE
          </CustomButton>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(FVFlowError)
