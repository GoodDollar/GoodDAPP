import React from 'react'
import renderer from 'react-test-renderer'
import Section from '../Section'

// Note: test renderer must be required after react-native.

describe('Section', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Section />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <Section>
        <Section.Title>GoodDollar is a good economy, each day you can collect your part in the economy</Section.Title>
        <Section.Row>
          <Section.Text>{`TODAY'S DAILY INCOME `}</Section.Text>
        </Section.Row>
      </Section>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
