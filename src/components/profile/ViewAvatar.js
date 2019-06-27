// @flow
import React from 'react'
import GDStore from '../../lib/undux/GDStore'
import { UserAvatar } from '../common'

const TITLE = 'View Avatar'

const ViewAvatar = props => {
  const store = GDStore.useStore()
  const profile = store.get('profile')

  const handleAvatarPress = event => {
    event.preventDefault()
    event.stopPropagation()
    props.screenProps.push('EditAvatar')
  }

  return <UserAvatar profile={profile} onPress={handleAvatarPress} originalSize={true} />
}

ViewAvatar.navigationOptions = {
  title: TITLE
}

export default ViewAvatar
