# appNavigation

### Table of Contents

* [NavBar](appnavigation.md#navbar)
* [getComponent](appnavigation.md#getcomponent)
  * [Parameters](appnavigation.md#parameters)
* [Rewards](appnavigation.md#rewards)
  * [Parameters](appnavigation.md#parameters-1)
* [AppView](appnavigation.md#appview)
  * [push](appnavigation.md#push)
    * [Parameters](appnavigation.md#parameters-2)
  * [goToRoot](appnavigation.md#gotoroot)
  * [navigateTo](appnavigation.md#navigateto)
    * [Parameters](appnavigation.md#parameters-3)
  * [goToParent](appnavigation.md#gotoparent)
  * [setScreenState](appnavigation.md#setscreenstate)
    * [Parameters](appnavigation.md#parameters-4)
  * [Parameters](appnavigation.md#parameters-5)
* [AppNavigation](appnavigation.md#appnavigation)
* [createStackNavigator](appnavigation.md#createstacknavigator)
  * [Parameters](appnavigation.md#parameters-6)
* [PushButton](appnavigation.md#pushbutton)
  * [Parameters](appnavigation.md#parameters-7)
* [BackButton](appnavigation.md#backbutton)
  * [Parameters](appnavigation.md#parameters-8)
* [DoneButton](appnavigation.md#donebutton)
  * [Parameters](appnavigation.md#parameters-9)
* [NextButton](appnavigation.md#nextbutton)
  * [Parameters](appnavigation.md#parameters-10)
* [useScreenState](appnavigation.md#usescreenstate)
  * [Parameters](appnavigation.md#parameters-11)

## NavBar

**Extends React.Component**

NavigationBar shows title and back button

## getComponent

getComponent gets the component and props and returns the same component except when shouldNavigateToComponent is present in component and not complaining This function can be written in every component that needs to prevent access if there is not in a correct navigation flow. Example: doesn't makes sense to navigate to Amount if there is no nextRoutes

### Parameters

* `Component` **React.Component** 
* `props`  

## Rewards

Rewards screen showing nested navigation with stackNavigator

### Parameters

* `props` **any** 

## AppView

**Extends Component**

Component wrapping the stack navigator. It holds the pop, push, gotToRoot and goToParent navigation logic and inserts on top the NavBar component. Params are passed as initial state for next screen. This navigation actions are being passed via navigationConfig to children components

### push

Push a route to the stack The stack is maintained in stack property to be able to navigate back and forward

#### Parameters

* `nextRoute`  
* `params`  

### goToRoot

Navigates to root screen. First on stack

### navigateTo

Navigates to specific screen with custom parameters as query string.

#### Parameters

* `routeName` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 
* `params` **any** 

### goToParent

Navigates to the screen that created the stack \(backRouteName\)

### setScreenState

Screen states are being stored by this component This way it can be kept between screens

#### Parameters

* `data`  

Pops from stack If there is no screen on the stack navigates to initial screen on stack \(goToRoot\) If we are currently in the first screen go to ths screen that created the stack \(goToParent\) we can use this to navigate back to previous screen with adding new params

### Parameters

* `params` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) new params to add to previous screen screenState

## AppNavigation

**Extends React.Component**

Switch navigation between all screens on the tabs. Each of this screen should be a StackNavigation Dashboard is the initial route

## createStackNavigator

Returns a navigator with a navbar wrapping the routes. This function is meant to be used to create a new stack navigation with the given routes.

### Parameters

* `routes` **\[Route\]** : Array with routes in the stack
* `navigationConfig` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) 

## PushButton

PushButton This button gets the push action from screenProps. Is meant to be used inside a stackNavigator

### Parameters

* `$0` **any** 
  * `$0.routeName`  
  * `$0.screenProps`  
  * `$0.canContinue`  
  * `$0.params`  
  * `$0.props` **...any** 
* `routeName`  
* `screenProps`  
* `params`  
* `props` **ButtonProps** 

## BackButton

BackButton This button gets the goToParent action from screenProps. Is meant to be used inside a stackNavigator

### Parameters

* `props` **ButtonProps** 

## DoneButton

BackButton This button gets the goToParent action from screenProps. Is meant to be used inside a stackNavigator

### Parameters

* `props` **ButtonProps** 

## NextButton

NextButton This button gets the nextRoutes param and creates a Push to the next screen and passes the rest of the array which are next screens for further Components. Is meant to be used inside a stackNavigator

### Parameters

* `props` **any** 
  * `props.disabled`  
  * `props.values`  
  * `props.screenProps`  
  * `props.nextRoutes`  
  * `props.label`  
  * `props.canContinue`  

## useScreenState

Hook to get screen state from stack or from useState hook if there is no setScreenState function

### Parameters

* `$0` **any** 
  * `$0.setScreenState`  
  * `$0.screenState`  

Returns **any**

