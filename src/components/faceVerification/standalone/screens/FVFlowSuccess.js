// libraries
import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'

// components
import Text from '../../../common/view/Text'
import { Section, Wrapper } from '../../../common'

// utils
import { FVFlowContext } from '../context/FVFlowContext'
import { redirectTo } from '../../../../lib/utils/linking'

import withStyles from '../theme/withStyles'

const FVFlowSuccess = ({ styles, screenProps }) => {
  const { rdu, cbu } = useContext(FVFlowContext)
  const { screenState } = screenProps

  useEffect(() => {
    const url = rdu || cbu

    if (url) {
      redirectTo(url, rdu ? 'rdu' : 'cbu', screenState || {})
    }
  }, [rdu, cbu, screenState])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <Text style={styles.text}>You can close this window and go back to the App</Text>
            </View>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(FVFlowSuccess)
