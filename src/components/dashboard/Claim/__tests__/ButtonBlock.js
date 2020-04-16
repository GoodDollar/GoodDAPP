import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ButtonBlock from '../ButtonBlock'

const styles = {
  stylesmainContainer: null,
  btnBlock: null,
}

describe('ButtonBlock', () => {
  const WrappedClaimButton = withThemeProvider(ButtonBlock)

  it('renders without errors and matches snapshot for non-citizen', () => {
    let tree

    expect(
      () =>
        (tree = renderer
          .create(
            <WrappedClaimButton
              styles={styles}
              isCitizen={false}
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

  it('matches snapshot for citizen without entitlement', () => {
    const component = renderer.create(
      <WrappedClaimButton
        styles={styles}
        isCitizen={true}
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
        nextClaim="00:10:00"
        loading={false}
        onPress={() => null}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
