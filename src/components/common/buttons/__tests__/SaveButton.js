import React from 'react'
import renderer from 'react-test-renderer'
import SaveButton from '../SaveButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const WrappedSaveButton = withThemeProvider(SaveButton)

// Note: test renderer must be required after react-native.

describe('WrappedSaveButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedSaveButton onPress={() => {}} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedSaveButton onPress={() => {}} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedSaveButton onPress={() => {}} mode="outlined">
        Title in SaveButton
      </WrappedSaveButton>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedSaveButton onPress={() => {}} color="#CCC">
        SaveButton with color
      </WrappedSaveButton>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedSaveButton onPress={() => {}} loadingDelay={3000} doneDelay={500}>
        SaveButton with custom delay
      </WrappedSaveButton>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
