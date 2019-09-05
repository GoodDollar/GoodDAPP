import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ClaimButton from '../ClaimButton'

describe('ClaimButton', () => {
  const WrappedClaimButton = withThemeProvider(ClaimButton)

  it('renders without errors', () => {
    const tree = renderer.create(
      <WrappedClaimButton isCitizen={true} entitlement={0} nextClaim="00:10:00" loading={false} onPress={() => null} />
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot for non-citizen', () => {
    const component = renderer.create(
      <WrappedClaimButton isCitizen={false} entitlement={0} nextClaim="00:10:00" loading={false} onPress={() => null} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for citizen without entitlement', () => {
    const component = renderer.create(
      <WrappedClaimButton isCitizen={true} entitlement={0} nextClaim="00:10:00" loading={false} onPress={() => null} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for citizen with entitlement', () => {
    const component = renderer.create(
      <WrappedClaimButton
        isCitizen={true}
        entitlement={100}
        nextClaim="00:10:00"
        loading={false}
        onPress={() => null}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
