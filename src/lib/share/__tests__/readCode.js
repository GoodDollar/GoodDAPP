import { readCode } from '../'

describe('readCode', () => {
  it(`should generate an string with an MNID valid code`, () => {
    // Given
    const code = '3cvdwVrcFXaMDBpkeJdrFKnfCyxQ1PDx6TG'

    // When
    const decoded = readCode(code)

    // Then
    expect(decoded).toEqual({ networkId: 121, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' })
  })

  it(`should return an string with the structure MNID|amount`, () => {
    // Given
    const code = '3cvdwVrcFXaMDBpkeJdrFKnfCyxQ1PDx6TG|1000'

    // When
    const decoded = readCode(code)

    // Then
    expect(decoded).toEqual(
      expect.objectContaining({
        amount: '1000',
        networkId: 121,
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      }),
    )
  })

  it(`(base64) should generate an string with an MNID valid code`, () => {
    // Given
    const code = Buffer.from(JSON.stringify({ mnid: '3cvdwVrcFXaMDBpkeJdrFKnfCyxQ1PDx6TG' }))
      .toString('base64')
      .replace(/=+$/, '')

    // When
    const decoded = readCode(code)

    // Then
    expect(decoded).toEqual(
      expect.objectContaining({ networkId: 121, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }),
    )
  })

  it(`(base64) should return an string with the structure MNID|amount`, () => {
    // Given
    const code = Buffer.from(JSON.stringify({ mnid: '3cvdwVrcFXaMDBpkeJdrFKnfCyxQ1PDx6TG', amount: '1000' })).toString(
      'base64',
    )

    // When
    const decoded = readCode(code)

    // Then
    expect(decoded).toEqual(
      expect.objectContaining({
        amount: '1000',
        networkId: 121,
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      }),
    )
  })

  it(`should return null if MNID is invalid`, () => {
    // Given
    const code = 'something invalid'

    // When
    const decoded = readCode(code)

    // Then
    expect(decoded).toBeNull()
  })

  it(`should return null if MNID broken format`, () => {
    // Given
    const code = '0x90f8bf6a479f|122'

    // When
    const decoded = readCode(code)

    // Then
    expect(decoded).toBeNull()
  })
})
