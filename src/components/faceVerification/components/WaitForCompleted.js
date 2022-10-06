import React from 'react'
import { t } from '@lingui/macro'

import Text from '../../common/view/Text'
import { Spinner } from '../../common/view/LoadingIndicator'

import normalize from '../../../lib/utils/normalizeText'
import { isLargeDevice } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'

const getStylesFromProps = () => ({
  spinner: {},
  text: {
    textAlign: 'center',
    fontSize: normalize(isLargeDevice ? 22 : 20),
    lineHeight: isLargeDevice ? 36 : 34,
  },
})

const WaitForCompleted = ({ styles, counter = false }) => (
  <>
    <Spinner style={styles.spinner} loading />
    <Text style={styles.text}>
      {t`Please wait until your verification is completed`}
      {counter !== false && (
        <>
          {`\n\n`}
          {counter}
        </>
      )}
    </Text>
  </>
)

export default withStyles(getStylesFromProps)(WaitForCompleted)
