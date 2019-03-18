import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Wrapper, TopBar, Section } from '../common'

const Profile = props => {
  return (
    <Wrapper>
      <Section style={styles.section}>
        <Text>Profile</Text>
      </Section>
    </Wrapper>
  )
}

Profile.navigationOptions = {
  title: 'Your Profile'
}

const styles = {}

export default createStackNavigator({ Profile })
