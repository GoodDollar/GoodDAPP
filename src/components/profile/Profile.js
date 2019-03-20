import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Icon } from 'react-native-elements'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Wrapper, Section, UserAvatar } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import EditProfile from './EditProfile'

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
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Icon name="email" color="rgb(85, 85, 85)" />
            <Text style={styles.tableRowText}>{profile.email}</Text>
          </View>
          <View style={styles.tableRow}>
            <Icon name="phone" color="rgb(85, 85, 85)" />
            <Text style={styles.tableRowText}>{profile.mobile}</Text>
          </View>
        </View>
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
    paddingRight: '1em'
  },
  table: {
    margin: '3em',
    borderTopStyle: 'solid',
    borderTopColor: '#d2d2d2',
    borderTopWidth: '1px'
  },
  tableRow: {
    paddingBottom: '0.5em',
    paddingTop: '0.5em',
    alignItems: 'flex-end',
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomColor: '#d2d2d2',
    borderBottomWidth: '1px'
  },
  tableRowText: {
    textAlign: 'right',
    flex: 1,
    color: 'rgb(85, 85, 85)',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  icon: {
    cursor: 'pointer'
  }
})

export default createStackNavigator({ Profile, EditProfile })
