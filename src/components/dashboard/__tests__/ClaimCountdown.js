import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import Countdown from '../ClaimCountdown'

describe('ClaimCountdown', () => {
  const WrappedCountdown = withThemeProvider(Countdown)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedCountdown nextClaim="00:10:00" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedCountdown nextClaim="00:10:00" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
