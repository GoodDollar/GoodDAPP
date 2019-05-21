# common

### Table of Contents

* [setLoadingWithStore](common.md#setloadingwithstore)
  * [Parameters](common.md#parameters)
* [BigGoodDollar](common.md#biggooddollar)
  * [Parameters](common.md#parameters-1)
* [TopBar](common.md#topbar)
  * [Parameters](common.md#parameters-2)
* [BigNumber](common.md#bignumber)
  * [Parameters](common.md#parameters-3)
* [InputGoodDollar](common.md#inputgooddollar)
  * [Parameters](common.md#parameters-4)
* [Avatar](common.md#avatar)
  * [Parameters](common.md#parameters-5)
* [IconButton](common.md#iconbutton)
  * [Parameters](common.md#parameters-6)
* [LoadingIndicator](common.md#loadingindicator)
* [EventDialog](common.md#eventdialog)
  * [Parameters](common.md#parameters-7)
* [CustomDialog](common.md#customdialog)
  * [Parameters](common.md#parameters-8)
* [UserAvatar](common.md#useravatar)
  * [Parameters](common.md#parameters-9)
* [CustomButton](common.md#custombutton)
  * [Parameters](common.md#parameters-10)

## setLoadingWithStore

Curried function wich requires an undux Store and then sets the flag to show/hide the LoadingIndicator component

### Parameters

* `store` **Store** undux store

Returns **function \(to:** [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**\): void** Sets `loading` to what `to` states. It requires `loadingIndicator` to be set in the Store's state

## BigGoodDollar

Receives wei and shows as G$ using BigNumber component

### Parameters

* `props` **Props** 
  * `props.number` [**Number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**?** 
  * `props.props` **...any** 

Returns **React.Node**

## TopBar

TopBar - used To display contextual information in a small container

### Parameters

* `props` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) an object with props
  * `props.hideBalance` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) if falsy balance will be displayed
  * `props.push` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) pushes a route to the nav stack. When called, apps navigates to the specified ruote
  * `props.children` **React.Node** 

Returns **React.Node**

## BigNumber

Receives a number and a unit to display

### Parameters

* `props` **Props** 
  * `props.number` [**Number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**?** Number to show
  * `props.unit` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** Units for the number
  * `props.elementStyles` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**?** Inner elements styles
  * `props.style` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**?** Outer element style

Returns **React.Node**

## InputGoodDollar

Receives wei and shows as G$ using `TextInput` component \(react-native-paper\).

### Parameters

* `props` **Props** 
  * `props.wei` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) to be shown as G$

Returns **React.Node**

## Avatar

Touchable Avatar

### Parameters

* `props` **Props** 
  * `props.onPress` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**?** 
  * `props.source` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 
  * `props.style` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**?** 
  * `props.size` [**Number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)  \(optional, default `34`\)

Returns **React.Node**

## IconButton

Returns a button with an icon and text

### Parameters

* `props` **IconProps** 
  * `props.text` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) to shown
  * `props.onPress` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) action
  * `props.disabled` [**Boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) 
  * `props.name` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) icon name
  * `props.iconProps` **...any** 

Returns **React.Node**

## LoadingIndicator

Provides a `LoadingIndicator` component which renders an ActivityIndicator over a semi-transparent background.

Returns **React.Node**

## EventDialog

EventDialog based on react-native-paper

### Parameters

* `props` **EventDialogProps** 
  * `props.visible` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?** 
  * `props.event` **TransactionEvent?** 
  * `props.onDismiss` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**?** 
  * `props.reason` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 

Returns **React.Node**

## CustomDialog

Custom Dialog based on react-native-paper

### Parameters

* `props` **DialogProps** 
  * `props.children` **\(React.Node \|** [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**\)?** 
  * `props.visible` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?** 
  * `props.title` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 
  * `props.message` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 
  * `props.dismissText` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 
  * `props.onDismiss` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**?** 
  * `props.loading` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?**  \(optional, default `false`\)

Returns **React.Node**

## UserAvatar

Touchable Users Avatar based on Avatar component

### Parameters

* `props` **AvatarProps** 
  * `props.profile` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) \]
    * `props.profile.avatar` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 
    * `props.profile.fullName` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 
  * `props.editable` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?** 
  * `props.size` [**Number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)  \(optional, default `120`\)

Returns **React.Node**

## CustomButton

Custom button based on react-native-paper

### Parameters

* `props` **Props** 
  * `props.children` **\(React.Node \|** [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**\)** If it's a string will add a Text component as child
  * `props.onPress` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 
  * `props.disabled` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?** 
  * `props.mode` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** 
  * `props.loading` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?** 
  * `props.color` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)  \(optional, default `#555555`\)
  * `props.dark` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**?** 
  * `props.uppercase` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)  \(optional, default `true`\)
  * `props.style` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**?** Button style

Returns **React.Node**

