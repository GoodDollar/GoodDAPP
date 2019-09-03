import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import * as libShare from '../../../../lib/share'
import GDStore from '../../../../lib/undux/GDStore'
import { withThemeProvider } from '../../../../__tests__/__util__'
const { Container } = GDStore

export const getComponentWithMocks = componentPath => {
  // Will then mock the LocalizeContext module being used in our LanguageSelector component
  jest.doMock('../../../../lib/share', () => {
    return {
      ...libShare,
      generateCode: () => '0xfakeAddress',
    }
  })

  // you need to re-require after calling jest.doMock.
  return require(`../${componentPath}`).default
}

const withContainer = Component => props => {
  const WrappedComponent = withThemeProvider(Component)
  return (
    <Container>
      <WrappedComponent {...props} />
    </Container>
  )
}

export const getWebRouterComponentWithRoutes = routes => {
  const AppNavigator = createSwitchNavigator(routes)
  class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
    static router = AppNavigator.router

    static navigationOptions = AppNavigator.navigationOptions

    render() {
      return <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
    }
  }
  return withContainer(createBrowserApp(createSwitchNavigator({ AppNavigation })))
}

export const getWebRouterComponentWithMocks = componentPath => {
  const Component = getComponentWithMocks(componentPath)

  const routes = {
    Component,
  }

  return getWebRouterComponentWithRoutes(routes)
}

export const convertDateToUTC = unixDate => {
  let date = new Date(unixDate)
  return date.getTime() + date.getTimezoneOffset() * 60000
}

export const mockEvent = (type, status) => ({
  type,
  id: '0x9812619905da200c4effe8cd2ca4b2b31eeddf133f8fd283069d2e5aec3b9f77',
  date: convertDateToUTC(1554130994000),
  createdDate: 'Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)',
  status: status || 'completed',
  data: {
    amount: 4,
    message: 'aaa',
    endpoint: {
      address: undefined,
      avatar:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII=',
      fullName: 'Misao Matimbo',
    },
  },
})

export const generateFeedItemProps = (type, status) => ({
  item: mockEvent(type, status),
  separators: {
    highlight: () => {},
    unhighlight: () => {},
  },
  onPress: () => {},
})
