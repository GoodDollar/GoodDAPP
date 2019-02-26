import React, { useContext } from 'react'
import Avatar from './Avatar'
import Section from './Section'
import BigNumber from './BigNumber'
import { AccountContext } from '../appNavigation/AccountProvider'

const TopBar = ({ hideBalance }) => {
  const { balance } = useContext(AccountContext)

  return (
    <Section>
      <Section.Row>
        <Avatar />
        {!hideBalance && <BigNumber number={balance} unit={'GD'} />}
      </Section.Row>
    </Section>
  )
}

export default TopBar
