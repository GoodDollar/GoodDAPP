import React from 'react'
import renderer from 'react-test-renderer'
import AddWebApp from '../AddWebApp.web'
import SimpleStore from '../../../../lib/undux/SimpleStore'

// Note: test renderer must be required after react-native.

describe('AddWebApp', () => {
  it('matches snapshot', () => {
    const component = renderer.create(
      <SimpleStore.Container>
        <AddWebApp />
      </SimpleStore.Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
