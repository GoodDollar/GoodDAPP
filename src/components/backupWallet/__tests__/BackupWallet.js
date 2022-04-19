import React from 'react'
import renderer from 'react-test-renderer'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import { getWebRouterComponentWithMocks } from './__util__'

// Note: test renderer must be required after react-native.

describe('BackupWallet', () => {
  beforeAll(async () => {
    await AsyncStorage.setItem('GD_masterSeed', 'a b c d e f g h i j k l')
  })
  it('matches snapshot', async () => {
    const BackupWallet = getWebRouterComponentWithMocks('../BackupWallet')
    let component
    await renderer.act(async () => (component = renderer.create(<BackupWallet />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
