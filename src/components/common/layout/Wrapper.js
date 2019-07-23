// @flow
import React from 'react'
import { ScrollView, View } from 'react-native'
import { withStyles } from '../../../lib/styles'

class Wrapper extends React.Component {
  render() {
    const { backgroundColor, children, style, styles, ...rest } = this.props
    const backgroundStyle = backgroundColor
      ? { backgroundColor: backgroundColor }
      : {
          backgroundImage:
            'linear-gradient(to bottom, #00AFFF, #2DC0F7, #28C0EF, #23C0E7, #1EC1DF, #19C1D7, #14C1CF, #0FC2C7, #0FC2C7, #0AC2BF, #05C2B7, #00C3AF)',
        }

    return (
      <View data-name="viewWrapper" style={[styles.container, backgroundStyle, style]} {...rest}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollableView}>
          {children}
        </ScrollView>
      </View>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    container: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      padding: theme.paddings.mainContainerPadding,
      width: '100%',
      position: 'relative',
    },
    scrollView: {
      display: 'flex',
      flexGrow: 1,
    },
    scrollableView: {
      flexGrow: 1,
      display: 'flex',
      height: '100%',
    },
  }
}

export default withStyles(getStylesFromProps)(Wrapper)
