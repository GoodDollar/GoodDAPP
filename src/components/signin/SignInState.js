// @flow
import React from 'react'
import Mnemonics from './Mnemonics'
import { createSwitchNavigator } from '@react-navigation/core'
import { createStackNavigator } from '../appNavigation/stackNavigation'

export default createStackNavigator(
  {
    Mnemonics
  },
  {
    backRouteName: 'Auth'
  }
)
