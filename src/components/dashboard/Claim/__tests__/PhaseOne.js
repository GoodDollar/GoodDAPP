import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import PhaseOne from '../PhaseOne'

const claimedToday = { amount: 1, people: 1 }
const styles = {
  stylesmainContainer: null,
}
describe('PhaseOne', () => {
  const WrappedPhaseOne = withThemeProvider(PhaseOne)

  it('renders without errors and matches snapshot', () => {
    let tree

    expect(
      () =>
        (tree = renderer
          .create(
            <WrappedPhaseOne
              styles={styles}
              isCitizen={true}
              claimedToday={claimedToday}
              entitlement={0}
              nextClaim="00:10:00"
              loading={false}
              onPress={() => null}
            />
          )
          .toJSON())
    ).not.toThrow()

    expect(tree).toBeTruthy()
    expect(tree).toMatchSnapshot()
  })
})
