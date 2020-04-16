import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import PhaseZero from '../PhaseZero'

const claimedToday = { amount: 1, people: 1 }
const styles = {
  stylesmainContainer: null,
}
describe('PhaseZero', () => {
  const WrappedPhaseZero = withThemeProvider(PhaseZero)

  it('renders without errors and matches snapshot', () => {
    let tree

    expect(
      () =>
        (tree = renderer
          .create(
            <WrappedPhaseZero
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
