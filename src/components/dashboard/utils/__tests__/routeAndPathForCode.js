import { routeAndPathForCode } from '../routeAndPathForCode'

describe('routeAndPathForCode', () => {
  it(`should fail if code is null`, () => {
    // Given
    const erroredCall = () => routeAndPathForCode('send', null)

    // Then
    expect(erroredCall).toThrowError('Invalid QR Code.')
  })

  it(`should fail if code is malformed`, () => {
    // Given
    const erroredCall = () => routeAndPathForCode('send', '123')

    // Then
    expect(erroredCall).toThrowError('Invalid network. Switch to Fuse.')
  })

  it(`should pass if code is valid`, () => {
    // Given
    const code = { networkId: 121, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }
    const { route, params } = routeAndPathForCode('send', code)

    // Then
    expect(route).toBe('Amount')
    expect(params).toEqual({ to: code.address, nextRoutes: ['Reason', 'SendQRSummary'] })
  })

  it(`should fail if screen is invalid`, () => {
    // Given
    const code = { networkId: 121, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }
    const erroredCall = () => routeAndPathForCode('invalidScreen', code)

    // Then
    expect(erroredCall).toThrowError('Invalid screen specified')
  })
})
