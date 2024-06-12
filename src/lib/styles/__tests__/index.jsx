import React from 'react'
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { withStyles } from '../index'

// Creating a undux mock store. It behaves as a basic undux store

describe('withStyles', () => {
  const theme = {
    color: 'red',
  }

  const MockComponent = ({ styles, theme }) => {
    return <React.Fragment>{JSON.stringify({ styles, theme })}</React.Fragment>
  }

  it('withStyles without mapThemeToStyles should injects theme and not styles', () => {
    const MockWithTheme = withStyles()(MockComponent)

    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <MockWithTheme />
      </PaperProvider>,
    )
    expect(tree.toJSON().children[0]).toMatch(JSON.stringify({ theme }))
  })

  it('withStyles injects theme and empty styles should work', () => {
    const styles = {}

    const MockWithTheme = withStyles(() => styles)(MockComponent)

    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <MockWithTheme />
      </PaperProvider>,
    )
    expect(tree.toJSON().children[0]).toMatch(JSON.stringify({ styles, theme }))
  })

  it('withStyles injects theme and empty styles should work with first level properties without StyleSheet', () => {
    const mapThemeToStyles = props => {
      return {
        color: theme.color,
        otherProperty: 'fixed-value',
      }
    }

    const MockWithTheme = withStyles(mapThemeToStyles, false)(MockComponent)

    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <MockWithTheme />
      </PaperProvider>,
    )
    expect(tree.toJSON().children[0]).toMatch(
      JSON.stringify({
        styles: {
          color: 'red',
          otherProperty: 'fixed-value',
        },
        theme,
      }),
    )
  })

  it('withStyles injects theme and empty styles should work with different names using StyleSheet', () => {
    const mapThemeToStyles = props => {
      return {
        button: {
          color: theme.color,
          backgroundColor: 'black',
        },
      }
    }

    const MockWithTheme = withStyles(mapThemeToStyles)(MockComponent)

    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <MockWithTheme />
      </PaperProvider>,
    )

    // create mirror stylesheet to then compare native ids
    const parsed = JSON.parse(tree.toJSON().children[0]).styles
    const stylesheet = StyleSheet.create(parsed)
    const flatten = StyleSheet.flatten(stylesheet.button)

    expect(tree.toJSON().children[0]).toMatch(
      JSON.stringify({
        styles: {
          button: flatten,
        },
        theme,
      }),
    )
  })
})
