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
    console.log(code)

    // Then
    expect(isMNID(code.split('|')[0])).toBeTruthy()
    expect(mnid).toEqual(code.split('|')[0])
  })

  it(`should return an string with the structure MNID|amount`, () => {
    // Given
    const address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    const networkId = 121
    const amount = 1000
    const reason = 'test encode'
    const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

    // When
    const code = generateCode(address, networkId, amount, reason)

    // Then
    expect(`${mnid}|${amount}|${reason}`).toEqual(code)
  })
})
