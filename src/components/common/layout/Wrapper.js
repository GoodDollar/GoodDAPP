// @flow
import React from 'react'
import { View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { withStyles } from '../../../lib/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'
import LinearGradient from 'react-native-linear-gradient'

const Wrapper = props => {
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = simpleStore.get && !simpleStore.get('isMobileSafariKeyboardShown')

  const growStyle = { flexGrow: shouldGrow ? 1 : 0 }

  const { backgroundColor, children, style, styles, ...rest } = props
  let Container
  const containerProps = {
    style: [styles.container, growStyle, style],
    'data-name': 'viewWrapper',
    ...rest
  }

  if (backgroundColor) {
    Container = View
    containerProps.style.push({ backgroundColor })
  } else {
    Container = LinearGradient
    containerProps.colors = [
      '#00AFFF',
      '#2DC0F7',
      '#28C0EF',
      '#23C0E7',
      '#1EC1DF',
      '#19C1D7',
      '#14C1CF',
      '#0FC2C7',
      '#0FC2C7',
      '#0AC2BF',
      '#05C2B7',
      '#00C3AF',
    ]
  }

  return (
    <Container {...containerProps}>
      {children}
    </Container>
  )
}

const getStylesFromProps = ({ theme }) => {
  let styles = {
    container: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      padding: theme.paddings.mainContainerPadding,
      width: '100%',
      position: 'relative',
    },
  }

  if (!isMobileOnly) {
    styles.container = { ...styles.container, maxHeight: theme.sizes.maxHeightForTabletAndDesktop }
  }

  return styles
}

export default withStyles(getStylesFromProps)(Wrapper)
