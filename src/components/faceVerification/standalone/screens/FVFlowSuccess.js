// libraries
import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

// components
import Text from '../../../common/view/Text'
import { Section, Wrapper } from '../../../common'

// utils
import { FVFlowContext } from '../context/FVFlowContext'
import { redirectTo } from '../../../../lib/utils/linking'
import API from '../../../../lib/API'
import { tryUntil } from '../../../../lib/utils/async'
import withStyles from '../theme/withStyles'
import useCountdown from '../../../../lib/hooks/useCountdown'

const waitForWhitelisted = account =>
  tryUntil(() => API.isWhitelisted(account), ({ isWhitelisted }) => isWhitelisted, 5, 5000)

const FVFlowSuccess = ({ styles, screenProps }) => {
  const [counter] = useCountdown(30)
  const { rdu, cbu, account } = useContext(FVFlowContext)

  useEffect(() => {
    const url = rdu || cbu
    const urlType = rdu ? 'rdu' : 'cbu'

    if (!url) {
      return
    }

    waitForWhitelisted(account)
      .catch(() => false)
      .then(verified => redirectTo(url, urlType, { verified }))
  }, [rdu, cbu])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <Text style={styles.text}>
                {t('Please wait while your verification is being completed...')} {counter}
              </Text>
            </View>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(FVFlowSuccess)
