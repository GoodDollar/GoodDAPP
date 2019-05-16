# dashboard

### Table of Contents

* [useEffect](dashboard.md#useeffect)
* [useEffect](dashboard.md#useeffect-1)
* [FeedListItem](dashboard.md#feedlistitem)
  * [Parameters](dashboard.md#parameters)
* [FeedActions](dashboard.md#feedactions)
  * [Parameters](dashboard.md#parameters-1)
* [ModalReceiveEvent](dashboard.md#modalreceiveevent)
  * [Parameters](dashboard.md#parameters-2)
* [ModalSendEvent](dashboard.md#modalsendevent)
  * [Parameters](dashboard.md#parameters-3)
* [ListEvent](dashboard.md#listevent)
  * [Parameters](dashboard.md#parameters-4)
* [FeedModalItem](dashboard.md#feedmodalitem)
  * [Parameters](dashboard.md#parameters-5)
* [GenerateLinkButton](dashboard.md#generatelinkbutton)
  * [Parameters](dashboard.md#parameters-6)
* [generateLinkAndSend](dashboard.md#generatelinkandsend)
* [withdraw](dashboard.md#withdraw)
  * [Parameters](dashboard.md#parameters-7)
* [dismissDialog](dashboard.md#dismissdialog)
* [dismissEventDialog](dashboard.md#dismisseventdialog)

## useEffect

Displays a summary when sending GD directly to a blockchain address

## useEffect

continue after valid FR to send the GD

## FeedListItem

Render list item according to the type for feed list

### Parameters

* `props`  
* `feedEvent` **FeedEventProps** feed event

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## FeedActions

Returns swipeable actions for items inside Feed list

### Parameters

* `feedItem` **FeedEventProps** Contains the feed item
  * `feedItem.item`  

Returns **any** React element with actions

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

## FeedModalItem

Render modal item according to the type for feed list in horizontal view

### Parameters

* `props` **FeedEventProps** feed event

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

## withdraw

Check if user can withdraw, and make the transaciton

### Parameters

* `hash` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Hash identifier
* `reason` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**?** Withdraw reason

## dismissDialog

Cancel withdraw and close dialog

## dismissEventDialog

Reset dialog data

