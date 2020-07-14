import React from 'react'
import renderer from 'react-test-renderer'
import EventDialog from '../EventDialog'
import { Wrapper } from '../../index'
import { mockEvent } from '../../../dashboard/__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

const event = mockEvent('Received')

describe('EventDialog', () => {
  const WrappedWrapper = withThemeProvider(Wrapper)
  it('renders without errors', () => {
    const tree = renderer.create(
      <WrappedWrapper>
        <EventDialog visible event={event}>
          Next
        </EventDialog>
      </WrappedWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedWrapper>
        <EventDialog visible event={event}>
          Next
        </EventDialog>
      </WrappedWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
