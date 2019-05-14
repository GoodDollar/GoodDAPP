import { encode, isMNID } from 'mnid'

import { generateCode } from '../'

describe('generateCode', () => {
  it(`should generate an string with an MNID valid code`, () => {
    // Given
    const address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    const networkId = 121
    const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

    // When
    const code = generateCode(address, networkId)
    console.log(code)

    // Then
    expect(isMNID(code)).toBeTruthy()
    expect(mnid).toEqual(code)
  })

  it(`should return an string with the structure MNID|amount`, () => {
    // Given
    const address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    const networkId = 121
    const amount = 1000
    const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

    // When
    const code = generateCode(address, networkId, amount)
    console.log(code)

    // Then
    expect(`${mnid}|${amount}`).toEqual(code)
  })
})
