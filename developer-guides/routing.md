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

In this example there are five possible routes at root level like this: `/Splash/, /Auth/, /Signup/, /Signin/, /AppNavigation/` .

This example also uses [createNavigator](https://reactnavigation.org/docs/en/custom-navigators.html#createnavigator). Notice that [AppSwitch](../docs/dapp/components-1.md) is a custom component that handles some common states for the entire app and holds some logic on start. Please refer to [AppSwitch](../docs/dapp/components-1.md) docs for more information.

{% hint style="info" %}
 Each of this is including a component that may or may not contain further navigation inside
{% endhint %}

Splash for instance is a single component without any further navigation and _'AppNavigation'_ contains the entire logged in flow.

There are a few patterns being used to handle navigation levels explained bellow.

## Stack Navigation





