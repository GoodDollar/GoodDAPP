import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import EventDialog from '../EventDialog'
import { Wrapper } from '../index'
import { mockEvent } from '../../dashboard/__tests__/__util__'

const event = mockEvent('Received')

describe('EventDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <Wrapper>
        <EventDialog visible event={event}>
          Next
        </EventDialog>
      </Wrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <Wrapper>
        <EventDialog visible event={event}>
          Next
        </EventDialog>
      </Wrapper>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
