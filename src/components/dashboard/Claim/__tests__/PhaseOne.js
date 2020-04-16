import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import PhaseOne from '../PhaseOne'

const claimedToday = { amount: 1, people: 1 }
const styles = {
  stylesmainContainer: null,
}
describe('PhaseOne', () => {
  const WrappedClaimButton = withThemeProvider(PhaseOne)

  it('matches snapshot for non-citizen', () => {
    const component = renderer.create(
      <WrappedClaimButton
        styles={styles}
        isCitizen={false}
        claimedToday={claimedToday}
        entitlement={0}
        nextClaim="00:10:00"
        loading={false}
        onPress={() => null}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for citizen without entitlement', () => {
    const component = renderer.create(
      <WrappedClaimButton
        styles={styles}
        isCitizen={true}
        claimedToday={claimedToday}
        entitlement={0}
        nextClaim="00:10:00"
        loading={false}
        onPress={() => null}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for citizen with entitlement', () => {
    const component = renderer.create(
      <WrappedClaimButton
        styles={styles}
        isCitizen={true}
        entitlement={100}
        claimedToday={claimedToday}
        nextClaim="00:10:00"
        loading={false}
        onPress={() => null}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
