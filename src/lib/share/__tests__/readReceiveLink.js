import Config from '../../../config/config'
import { readReceiveLink } from '../'

describe('readReceiveLink', () => {
  afterEach(() => {
    Config.env = 'development'
  })

  it(`should pass if URL has a valid structure`, () => {
    // Given
    const url = `${Config.publicUrl}/AppNavigation/Dashboard?receiveLink=0a1b2c3d4e5f6a7b8c9d&reason=pizzas`

    // When
    const result = readReceiveLink(url)

    // Then
    expect(result).toBe(url)
  })

  it(`should fail if URL isn't valid`, () => {
    // Given
    const url = `INVALID_CHARS${Config.publicUrl}/AppNavigation/Dashboard?receiveLink=0a1b2c3d4e5f6a7b8c9d&reason=pizza`

    // When
    const result = readReceiveLink(url)

    // Then
    expect(result).toBeNull()
  })

  it(`should fail if reason is missing in GD URL`, () => {
    // Given
    const url = `${Config.publicUrl}/AppNavigation/Dashboard?receiveLink=0a1b2c3d4e5f6a7b8c9d`

    // When
    const result = readReceiveLink(url)

    // Then
    expect(result).toBeNull()
  })

  it(`should fail if receiveLink is missing in GD URL`, () => {
    // Given
    const url = `${Config.publicUrl}/AppNavigation/Dashboard?reason=pizzas`

    // When
    const result = readReceiveLink(url)

    // Then
    expect(result).toBeNull()
  })

  it(`should fail if URL host is not GD Wallet's host`, () => {
    // Given
    const url = `https://example.com/AppNavigation/Dashboard?receiveLink=0a1b2c3d4e5f6a7b8c9d&reason=pizzas`

    // When
    const result = readReceiveLink(url)

    // Then
    expect(result).toBeNull()
  })

  it(`should fail if tld is required for an invalida public URL`, () => {
    // Given
    Config.env = 'production'
    console.log(Config)
    const url = `${Config.publicUrl}/AppNavigation/Dashboard?receiveLink=0a1b2c3d4e5f6a7b8c9d&reason=pizzas`

    // When
    const result = readReceiveLink(url)

    // Then
    expect(result).toBeNull()
  })
})
