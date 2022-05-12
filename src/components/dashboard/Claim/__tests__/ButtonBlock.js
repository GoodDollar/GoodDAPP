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

  it('renders without errors and matches snapshot for non-citizen', async () => {
    let tree

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (tree = renderer.create(
          <WrappedClaimButton
            styles={styles}
            isCitizen={false}
            entitlement={0}
            nextClaim="00:10:00"
            loading={false}
            onPress={() => null}
          />,
        )),
    )

    expect(tree).toBeTruthy()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for citizen without entitlement', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (component = renderer.create(
          <WrappedClaimButton
            styles={styles}
            isCitizen={true}
            entitlement={0}
            nextClaim="00:10:00"
            loading={false}
            onPress={() => null}
          />,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot for citizen with entitlement', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (component = renderer.create(
          <WrappedClaimButton
            styles={styles}
            isCitizen={true}
            entitlement={100}
            nextClaim="00:10:00"
            loading={false}
            onPress={() => null}
          />,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
