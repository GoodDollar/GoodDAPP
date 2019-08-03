// @flow
import React from 'react'
import GDStore from '../../lib/undux/GDStore'
import { Section, UserAvatar, Wrapper } from '../common'
import { withStyles } from '../../lib/styles'
import CircleButtonWrapper from './CircleButtonWrapper'
import CameraButton from './CameraButton'

const TITLE = 'Your Profile'

const ViewAvatar = props => {
  const { styles } = props
  const store = GDStore.useStore()
  const profile = store.get('profile')

  const handleCameraPress = event => {
    event.preventDefault()
    event.stopPropagation()
    props.screenProps.push('EditAvatar')
  }

  const handleClosePress = event => {
    event.preventDefault()
    event.stopPropagation()
    props.screenProps.push('Profile')
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <UserAvatar profile={profile} size={272} />
        <CircleButtonWrapper style={styles.closeButton} iconName={'close'} iconSize={20} onPress={handleClosePress} />
        <CameraButton style={styles.cameraButton} handleCameraPress={handleCameraPress} />
      </Section>
    </Wrapper>
  )
}

ViewAvatar.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    flex: 1,
    position: 'relative',
  },
  cameraButton: {
    left: 'auto',
    position: 'absolute',
    right: 12,
    top: theme.sizes.defaultDouble,
  },
  closeButton: {
    left: 12,
    position: 'absolute',
    top: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(ViewAvatar)
