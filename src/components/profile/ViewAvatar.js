// @flow
import React from 'react'
import GDStore from '../../lib/undux/GDStore'
import { Section, UserAvatar } from '../common'

const TITLE = 'View Avatar'

const ViewAvatar = props => {
  const store = GDStore.useStore()
  const profile = store.get('profile')

  return (
    <Section>
      <Section.Row>
        <UserAvatar profile={profile} onPress={() => props.screenProps.push('EditAvatar')} />
      </Section.Row>
    </Section>
  )
}

ViewAvatar.navigationOptions = {
  title: TITLE
}

export default ViewAvatar
