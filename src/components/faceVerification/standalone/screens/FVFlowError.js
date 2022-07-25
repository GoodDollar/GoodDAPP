// libraries
import React from 'react'
import { View } from 'react-native'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

// utils
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import { exitApp } from '../../../../lib/utils/system'
import { openLink } from '../../../../lib/utils/linking'

import withStyles from '../theme/withStyles'

const DOCS_URL = 'https://doc.gooddollar/sdk/identity'
const openDocs = () => openLink(DOCS_URL, '_blank')

const FVFlowError = ({ styles }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionWrapper}>
            <Text style={styles.text}>Login information is missing, for instructions please visit: </Text>
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

export default withStyles(FVFlowError)
