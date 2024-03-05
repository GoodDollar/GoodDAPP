// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

const screenState = {
  isValid: true,
}

jest.setTimeout(30000)

describe('FaceVerification IntroScreen', () => {
  it('matches snapshot', async () => {
    const IntroScreen = getWebRouterComponentWithMocks('../../faceVerification/screens/IntroScreen', {
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
