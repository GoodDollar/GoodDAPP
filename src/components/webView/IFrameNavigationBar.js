// @flow

// libraries
import React from 'react'
import { Appbar } from 'react-native-paper'
import { TouchableOpacity, View } from 'react-native'

// components
import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'

// utils
import useOnPress from '../../lib/hooks/useOnPress'

type Props = {
  navigate: Function,
  title: string,
  backToRoute?: string,
}

const styles = {
  wrapper: {
    position: 'relative',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textTransform: 'uppercase',
  },
  walletIcon: {
    position: 'absolute',
    right: 15,
  },
}

export default ({ navigate, title, backToRoute = 'Home' }: Props) => {
  const goBack = useOnPress(() => navigate(backToRoute), [navigate, backToRoute])

  return (
    <Appbar.Header dark style={styles.wrapper}>
      <View style={{ width: 48 }} />
      <Appbar.Content />
      <Section.Text color="white" fontWeight="medium" style={styles.title} testID="rewards_header">
        {title}
      </Section.Text>
      <Appbar.Content />
      <TouchableOpacity onPress={goBack} style={styles.walletIcon}>
        <Icon name="wallet" size={36} color="white" />
      </TouchableOpacity>
    </Appbar.Header>
  )
}
