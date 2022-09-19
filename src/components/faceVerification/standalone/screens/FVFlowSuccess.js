// libraries
import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

// components
import Text from '../../../common/view/Text'
import { Section, Wrapper } from '../../../common'

// utils
import { FVFlowContext } from '../context/FVFlowContext'
import { redirectTo } from '../../../../lib/utils/linking'
import API from '../../../../lib/API'
import { retry } from '../../../../lib/utils/async'
import withStyles from '../theme/withStyles'
const FVFlowSuccess = ({ styles, screenProps }) => {
  const [counter, setCounter] = useState(30)
  const { rdu, cbu, account } = useContext(FVFlowContext)
  const { screenState } = screenProps

  const waitForWhitelisted = () => {
    return retry(
      async () => {
        const { isWhitelisted } = await API.isWhitelisted(account)
        if (isWhitelisted) {
          return true
        }
        throw new Error('not whitelisted')
      },
      5,
      5000,
    ).catch(e => false)
  }

  useEffect(() => {
    const url = rdu || cbu

    waitForWhitelisted(account).then(isWhitelisted => {
      if (url) {
        redirectTo(url, rdu ? 'rdu' : 'cbu', { verified: isWhitelisted })
      }
    })
  }, [rdu, cbu, screenState])

  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000)
  }, [counter])

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
