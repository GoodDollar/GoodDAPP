import React from 'react'

import GDStore from '../../lib/undux/GDStore'
import Avatar from './Avatar'
import BigGoodDollar from './BigGoodDollar'
import Section from './Section'

const TopBar = ({ hideBalance, store }) => {
  const { balance } = store.get('account')

  return (
    <Section>
      <Section.Row>
        <Avatar />
        {!hideBalance && <BigGoodDollar number={balance} />}
      </Section.Row>
    </Section>
  )
}

export default GDStore.withStore(TopBar)
