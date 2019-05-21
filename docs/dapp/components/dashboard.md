# dashboard

### Table of Contents

* [useEffect](dashboard.md#useeffect)
* [useEffect](dashboard.md#useeffect-1)
* [FeedListItem](dashboard.md#feedlistitem)
  * [Parameters](dashboard.md#parameters)
* [routeAndPathForCode](dashboard.md#routeandpathforcode)
  * [Parameters](dashboard.md#parameters-1)
* [FeedActions](dashboard.md#feedactions)
  * [Parameters](dashboard.md#parameters-2)
* [FeedModalItem](dashboard.md#feedmodalitem)
  * [Parameters](dashboard.md#parameters-3)
* [ModalReceiveEvent](dashboard.md#modalreceiveevent)
  * [Parameters](dashboard.md#parameters-4)
* [ModalSendEvent](dashboard.md#modalsendevent)
  * [Parameters](dashboard.md#parameters-5)
* [ListEvent](dashboard.md#listevent)
  * [Parameters](dashboard.md#parameters-6)
* [GenerateLinkButton](dashboard.md#generatelinkbutton)
  * [Parameters](dashboard.md#parameters-7)
* [generateLinkAndSend](dashboard.md#generatelinkandsend)

## useEffect

Displays a summary when sending G$ directly to a blockchain address

## useEffect

continue after valid FR to send the G$

## FeedListItem

Render list item according to the type for feed list

### Parameters

* `props`  
* `feedEvent` **FeedEventProps** feed event

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## routeAndPathForCode

Returns a dictionary with route and params to be used by screenProps navigation

### Parameters

* `screen` [**screen**](https://developer.mozilla.org/docs/Web/Guide/Mobile) 
* `code` **\(**[**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) **\| null\)** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;**[**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&gt;** {route, params}

## FeedActions

Returns swipeable actions for items inside Feed list

### Parameters

* `feedItem` **FeedEventProps** Contains the feed item
  * `feedItem.item`  

Returns **any** React element with actions

## FeedModalItem

Render modal item according to the type for feed list in horizontal view

### Parameters

* `props` **FeedEventProps** feed event

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ModalReceiveEvent

Render modal withdraw item for feed list in horizontal view

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  
  * `feedEvent.onPress`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ModalSendEvent

Render modal send item for feed list in horizontal view

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  
  * `feedEvent.onPress`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ListEvent

Render list withdraw item for feed list

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## GenerateLinkButton

This button navigates to Amount screen passing nextRoutes param This param is used to navigate with NextButton which will handle push to next screen It also passes to param as initial state for Amount component

### Parameters

* `props` **screenProps** passed by navigation
  * `props.screenProps`  
  * `props.disabled`  

## generateLinkAndSend

Generates link to send and call send email/sms action

* Throws **any** Error if link cannot be send

