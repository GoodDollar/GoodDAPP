import React from 'react'
import Avatar from './Avatar'
import Section from './Section'
import BigNumber from './BigNumber'

const TopBar = ({ balance }) => (
  <Section>
    <Section.Row>
      <Avatar />
      {balance !== undefined && <BigNumber number={balance} unit={'GD'} />}
    </Section.Row>
  </Section>
)

export default TopBar
