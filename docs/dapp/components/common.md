# common

### Table of Contents

* [BigGoodDollar](common.md#biggooddollar)
  * [Parameters](common.md#parameters)
* [setLoadingWithStore](common.md#setloadingwithstore)
  * [Parameters](common.md#parameters-1)
* [TopBar](common.md#topbar)
  * [Parameters](common.md#parameters-2)
* [Avatar](common.md#avatar)
  * [Parameters](common.md#parameters-3)
* [IconButton](common.md#iconbutton)
  * [Parameters](common.md#parameters-4)
* [to](common.md#to)
  * [Parameters](common.md#parameters-5)
* [LoadingIndicator](common.md#loadingindicator)

## BigGoodDollar

Receives wei and shows as G$.

### Parameters

* `Props` **props** 
  * `Props.number`  
  * `Props.props` **...any** 

## setLoadingWithStore

Curried function wich requires an undux Store and then sets the flag to show/hide the LoadingIndicator component

### Parameters

* `store` **Store** undux store

Returns [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

## TopBar

TopBar - used To display contextual information in a small container

### Parameters

* `props` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) an object with props
  * `props.hideBalance` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) if falsy balance will be displayed
  * `props.push` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) pushes a route to the nav stack. When called, apps navigates to the specified ruote
  * `props.children` **React.Node** 

Returns **React.Node**

## Avatar

Touchable Avatar

### Parameters

* `props` **AvatarProps** 
* `AvatarProps` **props** 

## IconButton

Returns a button with an icon and text

### Parameters

* `props` **IconProps** 
  * `props.text`  
  * `props.onPress`  
  * `props.disabled`  
  * `props.iconProps` **...any** 

Returns **any** Button with icon and text

## to

Sets `loading` to what `to` states. It requires `loadingIndicator` to be set in the Store's state

### Parameters

* `to` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) 

## LoadingIndicator

Provides a `LoadingIndicator` component which renders an ActivityIndicator over a semi-transparent background.

