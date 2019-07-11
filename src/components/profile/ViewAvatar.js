// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Icon from 'react-native-elements/src/icons/Icon'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../lib/undux/GDStore'
import { Section, UserAvatar, Wrapper } from '../common'
import CameraButton from './CameraButton'

const TITLE = 'View Avatar'

const CloseButton = ({ handlePress, containerStyles = {}, iconStyles = {} }) => (
  <View style={[styles.container, containerStyles]}>
    <Icon
      onPress={handlePress}
      size={normalize(20)}
      color="#0C263D"
      name="close"
      reverse
      containerStyle={styles.icon}
    />
  </View>
)

const ViewAvatar = props => {
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
        <UserAvatar profile={profile} originalSize={true} containerStyle={styles.avatarContainer}>
          <CloseButton handlePress={handleClosePress} />
          <CameraButton containerStyles={styles.cameraButton} handleCameraPress={handleCameraPress} />
        </UserAvatar>
      </Section>
    </Wrapper>
  )
}

ViewAvatar.navigationOptions = {
  title: TITLE
}

const styles = StyleSheet.create({
  section: {
    flex: 1
  },
  avatarContainer: {
    flex: 1
  },
  cameraButton: {
    left: 'inherit',
    bottom: 'inherit',
    top: 0,
    right: 0
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  icon: {
    marginHorizontal: 0,
    marginVertical: 0
  }
})

export default ViewAvatar
