import React from 'react'
import renderer from 'react-test-renderer'
import ImportedSummaryTable from '../SummaryTable'
import { withThemeProvider } from '../../../../__tests__/__util__'
const SummaryTable = withThemeProvider(ImportedSummaryTable)

// Note: test renderer must be required after react-native.

describe('SummaryTable', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () =>
        (component = renderer.create(<SummaryTable counterPartyDisplayName="name" amount={20} reason="MyReason" />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with minimal properties', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<SummaryTable amount={20} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
