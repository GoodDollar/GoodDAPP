# dashboard

### Table of Contents

* [useEffect](dashboard.md#useeffect)
* [ModalWithdrawEvent](dashboard.md#modalwithdrawevent)
  * [Parameters](dashboard.md#parameters)
* [ListClaimEvent](dashboard.md#listclaimevent)
  * [Parameters](dashboard.md#parameters-1)
* [ListSendEvent](dashboard.md#listsendevent)
  * [Parameters](dashboard.md#parameters-2)
* [ListWithdrawEvent](dashboard.md#listwithdrawevent)
  * [Parameters](dashboard.md#parameters-3)
* [ModalClaimEvent](dashboard.md#modalclaimevent)
  * [Parameters](dashboard.md#parameters-4)
* [ModalSendEvent](dashboard.md#modalsendevent)
  * [Parameters](dashboard.md#parameters-5)
* [FeedListItem](dashboard.md#feedlistitem)
  * [Parameters](dashboard.md#parameters-6)
* [GenerateLinkButton](dashboard.md#generatelinkbutton)
  * [Parameters](dashboard.md#parameters-7)
* [FeedModalItem](dashboard.md#feedmodalitem)
  * [Parameters](dashboard.md#parameters-8)
* [sendLinkTo](dashboard.md#sendlinkto)
  * [Parameters](dashboard.md#parameters-9)
* [generateLinkAndSend](dashboard.md#generatelinkandsend)
* [withdraw](dashboard.md#withdraw)
  * [Parameters](dashboard.md#parameters-10)
* [dismissDialog](dashboard.md#dismissdialog)
* [dismissEventDialog](dashboard.md#dismisseventdialog)

## useEffect

Displays a summary when sending GD directly to a blockchain address

## ModalWithdrawEvent

Render modal withdraw item for feed list in horizontal view

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  
  * `feedEvent.onPress`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ListClaimEvent

Render list claim item for feed list

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ListSendEvent

Render list send item for feed list

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ListWithdrawEvent

Render list withdraw item for feed list

### Parameters

* `feedEvent` **FeedEventProps** feed event
  * `feedEvent.item`  

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## ModalClaimEvent

Render modal claim item for feed list in horizontal view

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

## FeedListItem

Render list item according to the type for feed list

### Parameters

* `props`  
* `feedEvent` **FeedEventProps** feed event

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## GenerateLinkButton

This button navigates to Amount screen passing nextRoutes param This param is used to navigate with NextButton which will handle push to next screen It also passes to param as initial state for Amount component

### Parameters

* `props` **screenProps** passed by navigation
  * `props.screenProps`  
  * `props.disabled`  

## FeedModalItem

Render modal item according to the type for feed list in horizontal view

### Parameters

* `props` **FeedEventProps** feed event

Returns [**HTMLElement**](https://developer.mozilla.org/docs/Web/HTML/Element)

## sendLinkTo

Send link via SMS or Email

### Parameters

* `to` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Email address or phone number
* `sendLink` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Link
* Throws **any** Error with invalid email/phone

Returns **any** JSON Object with ok if email or sms has been sent

## generateLinkAndSend

Generates link to send and call send email/sms action

* Throws **any** Error if link cannot be send

## withdraw

Check if user can withdraw, and make the transaciton

### Parameters

* `hash` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Hash identifier
* `reason` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Withdraw reason

## dismissDialog

Cancel withdraw and close dialog

## dismissEventDialog

Reset dialog data

