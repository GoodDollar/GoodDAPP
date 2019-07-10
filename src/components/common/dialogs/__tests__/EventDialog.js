import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { Provider as PaperProvider } from 'react-native-paper'
import EventDialog from '../EventDialog'
import { Wrapper } from '../../index'
import { mockEvent } from '../../../dashboard/__tests__/__util__'
import { theme } from '../../../theme/styles'

const event = mockEvent('Received')

describe('EventDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <Wrapper>
          <EventDialog visible event={event}>
            Next
          </EventDialog>
        </Wrapper>
      </PaperProvider>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <Wrapper>
          <EventDialog visible event={event}>
            Next
          </EventDialog>
        </Wrapper>
      </PaperProvider>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
