// libraries
import React, { useEffect } from 'react'
import { Linking, View } from 'react-native'

// components
import Text from '../../../common/view/Text'
import { Section, Wrapper } from '../../../common'

// utils
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import { exitApp } from '../../../../lib/utils/system'

import withStyles from '../theme/withStyles'

const DOCS_URL = 'https://doc.gooddollar/sdk/identity'
const openDocs = () => Linking.openUrl(DOCS_URL)

const LoginErrorScreen = ({ styles }) => {
  useEffect(() => {
    exitApp()
  }, [])

  return (
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
      </Section>
    </Wrapper>
  )
}

export default withStyles(LoginErrorScreen)
