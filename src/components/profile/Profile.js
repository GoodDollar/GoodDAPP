import React from 'react'
import { StyleSheet, View } from 'react-native'
import Icon from 'react-native-elements/src/icons/Icon'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Wrapper, Section, UserAvatar } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'

const log = logger.child({ from: 'Profile' })

const EditIcon = props => <IconButton {...props} name="edit" />
const PrivateIcon = props => <IconButton {...props} name="visibility" />

const IconButton = ({ onPress, disabled, ...iconProps }) => (
  <View style={styles.icon}>
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
          <PrivateIcon onPress={() => log.debug('PrivateIcon')} />
          <UserAvatar profile={profile} />
          <EditIcon onPress={() => screenProps.push('EditProfile')} />
        </Section.Row>
        <ProfileDataTable profile={profile} />
      </Section>
    </Wrapper>
  )
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
    cursor: 'pointer'
  }
})

export default createStackNavigator({ Profile, EditProfile })
