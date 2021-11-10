import { encode, isMNID } from 'mnid'

import { generateCode, readCode, VendorMetadata } from '../'

describe('generateCode', () => {
  it(`should generate a string with an MNID valid code`, () => {
    // Given
    const address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    const networkId = 121
    const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

    // When
    const code = generateCode(address, networkId)

    // Then
    expect(isMNID(code.m)).toBeTruthy()
    expect(mnid).toEqual(code.m)
  })

  it(`should return an object with data`, () => {
    // Given
    const address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    const networkId = 121
    const amount = 1000
    const reason = 'test encode'
    const category = 'test category encode'
    const counterPartyDisplayName = 'Counterparty Name'
    const mnid = encode({ address, network: `0x${networkId.toString(16)}` })
    const vendorInfo = new VendorMetadata(
      'http://shop.example.com/api/callback',
      'INV#33333',
      'http://shop.example.com',
      'Example Shop',
    )
    const vendorInfoConcise = vendorInfo.toConcise()

    // When
    const code = generateCode(address, networkId, amount, reason, category, counterPartyDisplayName, vendorInfo)

    // Then
    expect(code).toEqual({
      m: mnid,
      a: amount,
      r: reason,
      cat: category,
      c: counterPartyDisplayName,
      ven: vendorInfoConcise,
    })

    let paramsBase64 = encodeURIComponent(
      Buffer.from(JSON.stringify(code))
        .toString('base64')
        .replace(/=+$/, ''),
    )

    const vendorReadCode = readCode(paramsBase64)
    expect(vendorReadCode).toEqual({
      networkId,
      address,
      amount: amount,
      reason,
      category,
      counterPartyDisplayName,
      vendorInfo: {
        callbackUrl: 'http://shop.example.com/api/callback',
        invoiceId: 'INV#33333',
        website: 'http://shop.example.com',
        vendorName: 'Example Shop',
      },
    })
  })
})
