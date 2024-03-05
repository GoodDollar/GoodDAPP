import React from 'react'
import Separator from '../common/layout/Separator'
import { withStyles } from '../../lib/styles'

const ItemSeparator = ({ styles }) => <Separator color={styles.separatorColor} styles={styles.separator} />

export default withStyles(({ theme }) => ({
  separatorColor: theme.colors.gray50Percent,
  separator: {
    flex: 1,
    opacity: 0.3,
  },
}))(ItemSeparator)
