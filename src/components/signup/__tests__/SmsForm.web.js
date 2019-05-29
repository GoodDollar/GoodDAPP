import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import SmsForm from '../SmsForm.web'

const { Container } = GDStore

describe('SmsForm', () => {
  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ SmsForm }))
    const tree = renderer.create(
      <Container>
        <WebRouter />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ SmsForm }))
    const component = renderer.create(
      <Container>
        <WebRouter />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
