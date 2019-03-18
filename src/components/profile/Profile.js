import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Wrapper, Avatar, Section } from '../common'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'Profile' })

const Profile = props => {
  const userStorage = useWrappedUserStorage()
  const [profile, setProfile] = useState('Loading...')

  async function fetchProfile() {
    const fullName = await userStorage.getProfileField('fullName').then(v => v.display)
    const email = await userStorage.getProfileField('email').then(v => v.display)
    const mobile = await userStorage.getProfileField('mobile').then(v => v.display)

    setProfile({ fullName, email, mobile })
  }

  useEffect(() => {
    fetchProfile()
  }, [profile.fullName])
  log.debug({ userStorage, profile })
  return (
    <Wrapper>
      <Section>
        <Section.Row style={styles.centered}>
          <Avatar size={120} />
        </Section.Row>
        <Section.Row style={styles.centered}>
          <Section.Title>{profile.fullName}</Section.Title>
        </Section.Row>
        <Section.Row style={styles.centered}>
          <Section.Text>{profile.email}</Section.Text>
        </Section.Row>
        <Section.Row style={styles.centered}>
          <Section.Text>{profile.mobile}</Section.Text>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Profile.navigationOptions = {
  title: 'Your Profile'
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  }
})

export default createStackNavigator({ Profile })
