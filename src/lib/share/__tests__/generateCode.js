import { encode, isMNID } from 'mnid'

import { generateCode } from '../'

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
    const counterPartyDisplayName = 'Counterparty Name'
    const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

    // When
    const code = generateCode(address, networkId, amount, reason, counterPartyDisplayName)

    // Then
    expect(code).toEqual({ m: mnid, a: amount, r: reason, c: counterPartyDisplayName })
  })
})
