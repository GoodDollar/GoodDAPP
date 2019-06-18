import React from 'react'
import { StyleSheet, View } from 'react-native'
import Icon from 'react-native-elements/src/icons/Icon'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Wrapper, Section, UserAvatar } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Profile'
const log = logger.child({ from: TITLE })

const EditIcon = props => <IconButton {...props} wrapperStyle={styles.iconRight} name="edit" />
const PrivateIcon = props => <IconButton {...props} wrapperStyle={styles.iconLeft} name="visibility" />

const IconButton = ({ onPress, disabled, wrapperStyle, ...iconProps }) => (
  <View style={[styles.icon, wrapperStyle]}>
    <Icon onPress={onPress} raised color="rgb(85, 85, 85)" {...iconProps} />
  </View>
)

const Profile = props => {
  const profile = GDStore.useStore().get('profile')
  const { screenProps } = props
  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          {/* <PrivateIcon onPress={() => log.debug('PrivateIcon')} /> */}
          <UserAvatar profile={profile} />
          <EditIcon onPress={() => screenProps.push('EditProfile')} />
        </Section.Row>
        <ProfileDataTable profile={profile} />
      </Section>
    </Wrapper>
  )
}

Profile.navigationOptions = {
  title: TITLE
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
    marginBottom: 'auto',
    minHeight: '100%'
  },
  icon: {
    top: 0,
    position: 'absolute'
  },
  iconRight: {
    right: 0
  },
  iconLeft: {
    left: 0
  }
})

export default createStackNavigator({ Profile, EditProfile })
