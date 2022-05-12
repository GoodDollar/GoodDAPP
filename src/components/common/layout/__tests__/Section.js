import React from 'react'
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'
import Section from '../Section'
import { theme } from '../../../theme/styles'

// Note: test renderer must be required after react-native.

describe('Section', () => {
  it('matches snapshot', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <Section>
          <Section.Title>GoodDollar is a good economy, each day you can collect your part in the economy</Section.Title>
          <Section.Row>
            <Section.Text>{`TODAY'S DAILY INCOME `}</Section.Text>
          </Section.Row>
        </Section>
      </PaperProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <Section>
          <Section.Stack grow>
            <Section.Text>Second text</Section.Text>
          </Section.Stack>
          <Section.Row alignItems="flex-end">
            <Section.Text>{`TODAY'S DAILY INCOME `}</Section.Text>
          </Section.Row>
        </Section>
      </PaperProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
