// @flow
import React from 'react'

import Text from '../../common/view/Text'

export default ({ styles }) => (
  <Text
    numberOfLines={1}
    lineHeight={19}
    color="gray80Percent"
    fontSize={10}
    textTransform="capitalize"
    style={styles.message}
  >
    {"You've claimed G$ for 14 days & your spot is secured"}
  </Text>
)
