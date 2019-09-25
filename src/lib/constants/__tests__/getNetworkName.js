import { getNetworkName } from '../network'

describe('getNetowrkName', () => {
  it(`should return UNDEFINED if networkId is not in the NETWORK_ID dictionary`, () => {
    // Given
    const networkId = 9999

    // When
    const networkName = getNetworkName(networkId)

    // Then
    expect(networkName).toMatch('UNDEFINED')
  })

  it(`should return FUSE for networkId 122`, () => {
    // Given
    const networkId = 122

    // When
    const networkName = getNetworkName(networkId)

    // Then
    expect(networkName).toMatch('FUSENET')
  })

  it(`should return 'RSK TESTNET' for networkId 31`, () => {
    // Given
    const networkId = 31

    // When
    const networkName = getNetworkName(networkId)

    // Then
    expect(networkName).toMatch('RSK TESTNET')
  })
})
