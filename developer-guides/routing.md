---
description: Describes how routes are being organized in the project
---

# Routing

## Getting Started

Navigation across the project is being done using [react-navigation](https://reactnavigation.org/docs/en/web-support.html). Therefore routing is also handled by react-navigation. 

Navigation flows are hierarchical starting on _'./src/Router.js'_ 

```
const AppNavigator = createNavigator(
  AppSwitch,
  SwitchRouter(
    {
      Splash,
      Auth,
      Signup,
      SignIn,
      AppNavigation
    },
    {
      initialRouteName: 'Splash'
    }
  ),
  {}
)
```

In this example there are five possible routes at root level like this: `/Splash/,` `/Auth/`, `/Signup/`, `/Signin/`, `/AppNavigation/`

This example also uses [createNavigator](https://reactnavigation.org/docs/en/custom-navigators.html#createnavigator). Notice that [AppSwitch]() is a custom component that handles some common states for the entire app and holds some logic on start. Please refer to [AppSwitch]() docs for more information.

{% hint style="info" %}
 Each of this is including a component that may or may not contain further navigation inside
{% endhint %}

_'Splash'_ for instance is a single component without any further navigation and _'_[_AppNavigation_](../docs/dapp/components/appnavigation.md)_'_ contains the entire logged in flow.

There are a few patterns being used to handle navigation levels explained bellow.

## Switch Navigation

There are several navigation levels using [createSwitchNavigator](https://reactnavigation.org/docs/en/switch-navigator.html). This is the standard navigator for web and it behaves by simply show one screen at the time. When that's the case in order to navigate

```
props.navigation.navigate('NewScreen')
```

## Stack Navigation

This navigation is being used in several screens. Is build on top of [createSwitchNavigator](https://reactnavigation.org/docs/en/switch-navigator.html) and it has primitives which are similar to the stackNavigator included in react-navigation which is not included in the web version.

[createStackNavigation](../docs/dapp/components/appnavigation.md#createstacknavigator) exports a switchNavigator in which the children routes gets via `props.screenProps` all the stack primitives such as `push()`, `back()`, etc.

Example

```text
cosnt ChildrenComponent = props => {
   const handleGoToSendConfirmation = () => props.screenProps.push('SendConfirmation', { sendLink, amount, reason, to })

   ...
}
```

### Stack Navigation Components

There are a few components that serve as support to this all of them exported in the './src/appNavigation/stackNavigation.js' file such as

* [PushButton](../docs/dapp/components/appnavigation.md#pushbutton)
* [BackButton](../docs/dapp/components/appnavigation.md#backbutton)
* [DoneButton](../docs/dapp/components/appnavigation.md#donebutton)

This components take `screenProps` as parameter and use stack methods to perform the actions.

### Stack Navigation State

When inside a stack can be saved in order to be available on back. In order to do so there is a hook called [useScreenState](../docs/dapp/components/appnavigation.md#usescreenstate) available.

