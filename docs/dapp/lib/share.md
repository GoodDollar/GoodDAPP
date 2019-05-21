# share

### Table of Contents

* [generateCode](share.md#generatecode)
  * [Parameters](share.md#parameters)
* [readCode](share.md#readcode)
  * [Parameters](share.md#parameters-1)
* [readReceiveLink](share.md#readreceivelink)
  * [Parameters](share.md#parameters-2)
* [extractQueryParams](share.md#extractqueryparams)
  * [Parameters](share.md#parameters-3)
* [generateShareObject](share.md#generateshareobject)
  * [Parameters](share.md#parameters-4)
* [generateHrefLinks](share.md#generatehreflinks)
  * [Parameters](share.md#parameters-5)
* [generateShareLink](share.md#generatesharelink)
  * [Parameters](share.md#parameters-6)

## generateCode

Generates a code contaning an MNID with an amount if this las one is speced

### Parameters

* `address` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) address required to generate MNID
* `networkId` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) network identifier required to generate MNID
* `amount` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) amount to be attached to the generated MNID code

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 'MNID\|amount'\|'MNID'

## readCode

Extracts the information from the generated code in `generateCode`

### Parameters

* `code` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) code returned by `generateCode`

Returns **\(null \| {amount: any, address, networkId:** [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**}\)**

## readReceiveLink

Parses the read ReceiveGDLink from QR Code. If not valid, returns null. If valid, returns the ReceiveGDLink.

### Parameters

* `link` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) receive G$ Link

Returns **\(**[**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) **\| null\)** {link\|null}

## extractQueryParams

Extracts query params values and returns them as a key-value pair

### Parameters

* `link` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) url with queryParams \(optional, default `''`\)

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) {key: value}

## generateShareObject

Generates the standard object required for `navigator.share` method to trigger Share menu on mobile devices

### Parameters

* `url` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Link

Returns **ShareObject**

## generateHrefLinks

Generates the links to share via anchor tag

### Parameters

* `sendLink` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Link
* `to` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Email address or phone number \(optional, default `''`\)

Returns [**Array**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)**&lt;HrefLinkProps&gt;**

## generateShareLink

Generates URL link to share/receive GDs

### Parameters

* `action` **ActionType** Wether 'receive' or 'send' \(optional, default `'receive'`\)
* `params` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) key-pair of query params to be added to the URL \(optional, default `{}`\)

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) URL to use to share/receive GDs

