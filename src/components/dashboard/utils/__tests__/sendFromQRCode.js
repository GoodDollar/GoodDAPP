import { sendFromQRCode } from '../sendFromQRCode'

describe('sendFromQRCode', () => {
  it(`should return a curried function`, () => {
    // Given
    const curriedFunction = sendFromQRCode('send')

    // Then
    expect(curriedFunction).toBeInstanceOf(Function)
  })

  it(`should fail if code is null`, () => {
    // Given
    const curriedFunction = sendFromQRCode('send')

    // When
    const erroredCall = () => curriedFunction(null)

    // Then
    expect(erroredCall).toThrowError('Invalid QR Code.')
  })

  it(`should fail if code is malformed`, () => {
    // Given
    const curriedFunction = sendFromQRCode('send')

    // When
    const erroredCall = () => curriedFunction('123')

    // Then
    expect(erroredCall).toThrowError('Invalid network. Switch to Fuse.')
  })

  it(`should pass if code is valid`, () => {
    // Given
    const curriedFunction = sendFromQRCode('send')

    // When
    const code = { networkId: 121, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }
    const [route, params] = curriedFunction(code)

    // Then
    expect(route).toBe('Amount')
    expect(params).toEqual({ to: code.address, nextRoutes: ['Reason', 'SendQRSummary'] })
  })

  it(`should fail if screen is invalid`, () => {
    // Given
    const curriedFunction = sendFromQRCode('invalidScreen')

    // When
    const code = { networkId: 121, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }
    const erroredCall = () => curriedFunction(code)

    // Then
    expect(erroredCall).toThrowError('Invalid screen specified')
  })
})
