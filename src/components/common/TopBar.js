import React from 'react'

import GDStore from '../../lib/undux/GDStore'
import Avatar from './Avatar'
import BigGoodDollar from './BigGoodDollar'
import Section from './Section'

/**
 * TopBar - used To display contextual information in a small container
 * @param {boolean} hideBalance - if falsy balance will be displayed
 * @param {function} push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {object} children - React Component
 * @returns {*}
 * @constructor
 */
const TopBar = ({ hideBalance, push, children }) => {
  const store = GDStore.useStore()
  const { balance } = store.get('account')
  const { avatar } = store.get('profile')

  return (
    <Section>
      <Section.Row>
        <Avatar source={avatar} onPress={push && (() => push('Profile'))} />
        {/*
         if children exist, it will be rendered
         if children=undefined and hideBalance=false, BigGoodDollar will be rendered
         if children=undefined and hideBalance=true, nothing will be rendered
         */}
        {children ? children : !hideBalance && <BigGoodDollar number={balance} />}
      </Section.Row>
    </Section>
  )
}

export default TopBar
