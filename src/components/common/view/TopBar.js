import React, { useCallback } from 'react'
import { Platform, StyleSheet } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import Section from '../layout/Section'
import useOnPress from '../../../lib/hooks/useOnPress'
import Avatar from './Avatar'
import BigGoodDollar from './BigGoodDollar'

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const TopBar = ({ hideBalance, push, children, hideProfile = true, profileAsLink = true }) => {
  const store = GDStore.useStore()
  const { balance } = store.get('account')
  const { avatar } = store.get('profile')

  const redirectToProfile = useCallback(() => push('Profile'), [push])
  const _onPress = useOnPress(() => (push && profileAsLink ? redirectToProfile : null), [
    push,
    profileAsLink,
    redirectToProfile,
  ])

  return (
    <Section style={styles.topBar}>
      <Section.Row
        alignItems={Platform.select({
          web: 'center',
          default: 'flex-end',
        })}
        style={{ flexDirection: 'row-reverse' }}
      >
        {/*
         if children exist, it will be rendered
         if children=undefined and hideBalance=false, BigGoodDollar will be rendered
         if children=undefined and hideBalance=true, nothing will be rendered
         */}
        {children ? children : !hideBalance && <BigGoodDollar number={balance} />}
        {hideProfile !== true && <Avatar source={avatar} onPress={_onPress} />}
      </Section.Row>
    </Section>
  )
}

const styles = StyleSheet.create({
  topBar: {
    justifyContent: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingTop: 8,
    height: 62,
  },
})

export default TopBar
