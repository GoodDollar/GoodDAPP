import React from 'react'

import GDStore from '../../lib/undux/GDStore'
import Avatar from './Avatar'
import BigGoodDollar from './BigGoodDollar'
import Section from './Section'

const TopBar = ({ hideBalance, store, push }) => {
  const { balance } = store.get('account')

  return (
    <Section>
      <Section.Row>
        <Avatar onPress={push && (() => push('Profile'))} />
        {!hideBalance && <BigGoodDollar number={balance} />}
      </Section.Row>
    </Section>
  )
}

export default GDStore.withStore(TopBar)
