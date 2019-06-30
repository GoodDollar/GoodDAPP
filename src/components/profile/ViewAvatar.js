// @flow
import React from 'react'
import GDStore from '../../lib/undux/GDStore'
import { UserAvatar } from '../common'
import CameraButton from './CameraButton'

const TITLE = 'View Avatar'

const ViewAvatar = props => {
  const store = GDStore.useStore()
  const profile = store.get('profile')

  const handleCameraPress = event => {
    event.preventDefault()
    event.stopPropagation()
    props.screenProps.push('EditAvatar')
  }

  return (
    <UserAvatar profile={profile} originalSize={true}>
      <CameraButton containerStyles={{ left: '10%', bottom: '10%' }} handleCameraPress={handleCameraPress} />
    </UserAvatar>
  )
}

ViewAvatar.navigationOptions = {
  title: TITLE
}

export default ViewAvatar
