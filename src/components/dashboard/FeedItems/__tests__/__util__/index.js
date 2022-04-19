import React from 'react'

export const getMockedEvent = (componentPath, event) => {
  // Will then mock the LocalizeContext module being used in our LanguageSelector component
  jest.doMock('../../../../../lib/share', () => {
    console.info({
      generateEvent: () => event,
    })
    return {
      generateEvent: () => event,
    }
  })

  // you need to re-require after calling jest.doMock.
  return require(`../${componentPath}`).default
}

const withContainer = Component => props => <Component {...props} />

export const getComponentWithMock = (componentPath, event) => {
  const Component = getMockedEvent(componentPath, event)
  return withContainer({ Component })
}
