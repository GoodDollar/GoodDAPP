// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

const screenState = {
  isValid: true,
}

jest.setTimeout(30000)

// mock useIdentityExpiryDate so it doesn't require a live Web3 provider in tests
jest.mock('@gooddollar/web3sdk-v2', () => {
  const { BigNumber } = jest.requireActual('ethers')

  return {
    ...jest.requireActual('@gooddollar/web3sdk-v2'),
    useIdentityExpiryDate: jest.fn(() => [
      { lastAuthenticated: BigNumber.from(0), authPeriod: BigNumber.from(360) },
      null,
      'done',
    ]),
  }
})

describe('FaceVerification IntroScreen (standalone)', () => {
  it('matches snapshot for new user (isReverify === false)', async () => {
    const IntroScreen = getWebRouterComponentWithMocks('../../faceVerification/standalone/screens/IntroScreen', {
      screenProps: { pop: () => {}, screenState },
    })
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () => (component = renderer.create(<IntroScreen />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for reverify user (isReverify === true)', async () => {
    const { BigNumber } = require('ethers')
    const lastAuthenticated = BigNumber.from(Math.floor(Date.now() / 1000) - 86400)

    require('@gooddollar/web3sdk-v2').useIdentityExpiryDate.mockReturnValue([
      { lastAuthenticated, authPeriod: BigNumber.from(360) },
      null,
      'done',
    ])

    const IntroScreen = getWebRouterComponentWithMocks('../../faceVerification/standalone/screens/IntroScreen', {
      screenProps: { pop: () => {}, screenState },
    })

    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () => (component = renderer.create(<IntroScreen />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
