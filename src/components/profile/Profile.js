// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { withTheme } from 'react-native-paper'
import { Icon } from 'react-native-elements/src/icons/Icon'
import GDStore from '../../lib/undux/GDStore'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Section, UserAvatar, Wrapper } from '../common'
import EditAvatar from './EditAvatar'
import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'
import ProfilePrivacy from './ProfilePrivacy'
import ViewAvatar from './ViewAvatar'

const TITLE = 'Profile'

const PrivateIcon = props => <ThemedIconButton {...props} wrapperStyle={styles.iconLeft} name="person-outline" />

const EditIcon = props => <ThemedIconButton {...props} wrapperStyle={styles.iconRight} name="edit" />

const IconButton = ({ onPress, disabled, wrapperStyle, theme, ...iconProps }) => (
  <View style={[styles.icon, wrapperStyle]}>
    <Icon onPress={onPress} color={theme.colors.darkBlue} {...iconProps} reverse size={20} />
  </View>
)

const ThemedIconButton = withTheme(IconButton)

const Profile = props => {
  const profile = GDStore.useStore().get('profile')
  const { screenProps } = props

  const handleAvatarPress = event => {
    event.preventDefault()
    event.stopPropagation()
    screenProps.push(`${profile.avatar ? 'View' : 'Edit'}Avatar`)
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row justifyContent="center" alignItems="center">
          <PrivateIcon onPress={() => screenProps.push('ProfilePrivacy')} />
          <UserAvatar profile={profile} onPress={handleAvatarPress} />
          <EditIcon onPress={() => screenProps.push('EditProfile')} />
        </Section.Row>
        <ProfileDataTable profile={profile} />
      </Section>
    </Wrapper>
  )
}

Profile.navigationOptions = {
  title: TITLE,
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
    marginBottom: 'auto',
    minHeight: '100%',
  },
  icon: {
    top: 0,
    position: 'absolute',
  },
  iconRight: {
    right: 0,
  },
  iconLeft: {
    left: 0,
  },
})

export default createStackNavigator({ Profile, EditProfile, ProfilePrivacy, ViewAvatar, EditAvatar })
