# common

### Table of Contents

* [React](common.md#react)
* [TopBar](common.md#topbar)
  * [Parameters](common.md#parameters)
* [IconButton](common.md#iconbutton)
  * [Parameters](common.md#parameters-1)
* [setLoadingWithStore](common.md#setloadingwithstore)
  * [Parameters](common.md#parameters-2)
* [to](common.md#to)
  * [Parameters](common.md#parameters-3)
* [LoadingIndicator](common.md#loadingindicator)

## React

Provides a `LoadingIndicator` component which renders an ActivityIndicator over a semi-transparent background. Also provides a helper function to show/hide the component.

## TopBar

TopBar - used To display contextual information in a small container

### Parameters

* `$0` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) 
  * `$0.hideBalance`  
  * `$0.push`  
  * `$0.children`  
* `hideBalance` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) if falsy balance will be displayed
* `push` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) pushes a route to the nav stack. When called, apps navigates to the specified ruote
* `children` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) React Component

Returns **any**

## IconButton

Returns a button with an icon and text

### Parameters

* `props` **IconProps** 
  * `props.text`  
  * `props.onPress`  
  * `props.disabled`  
  * `props.iconProps` **...any** 

Returns **any** Button with icon and text

## setLoadingWithStore

Curried function wich requires an undux Store and then sets the flag to show/hide the LoadingIndicator component

### Parameters

* `store` **Store** undux store

Returns [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

## to

Sets `loading` to what `to` states. It requires `loadingIndicator` to be set in the Store's state

### Parameters

* `to` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) 

## LoadingIndicator

Provides a `LoadingIndicator` component which renders an ActivityIndicator over a semi-transparent background.

Returns **any** React component

