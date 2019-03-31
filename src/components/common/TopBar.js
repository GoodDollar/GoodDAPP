import React from 'react'

import GDStore from '../../lib/undux/GDStore'
import Avatar from './Avatar'
import BigGoodDollar from './BigGoodDollar'
import Section from './Section'

const TopBar = ({ hideBalance, push }) => {
  const store = GDStore.useStore()
  const { balance } = store.get('account')
  const { avatar } = store.get('profile')

  return (
    <Section>
      <Section.Row>
        <Avatar source={avatar} onPress={push && (() => push('Profile'))} />
        {!hideBalance && <BigGoodDollar number={balance} />}
      </Section.Row>
    </Section>
  )
}

export default TopBar
