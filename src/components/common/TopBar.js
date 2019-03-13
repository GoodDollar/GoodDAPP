import React from 'react'

import GDStore from '../../lib/undux/GDStore'
import Avatar from './Avatar'
import BigNumber from './BigNumber'
import Section from './Section'

const TopBar = ({ hideBalance, store }) => {
  const { balance } = store.get('account')

  return (
    <Section>
      <Section.Row>
        <Avatar />
        {!hideBalance && <BigNumber number={balance} unit={'GD'} />}
      </Section.Row>
    </Section>
  )
}

export default GDStore.withStore(TopBar)
