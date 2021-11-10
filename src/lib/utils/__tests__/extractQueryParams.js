import { extractQueryParams } from '../uri'

describe('extractQueryParams', () => {
  it(`should return an object with key-value pairs from URL`, () => {
    // Given
    const url = 'http://example.com?param1=abc&param2=def'

    // When
    const params = extractQueryParams(url)

    // Then
    expect(params).toMatchObject({ param1: 'abc', param2: 'def' })
  })

  it(`should return an empty string if no value defined`, () => {
    // Given
    const url = 'http://example.com?param1=&param2=def'

    // When
    const params = extractQueryParams(url)

    // Then
    expect(params).toMatchObject({ param1: '', param2: 'def' })
  })

  it(`should return an empty object if no params are available`, () => {
    // Given
    const url = 'http://example.com'

    // When
    const params = extractQueryParams(url)

    // Then
    expect(params).toMatchObject({})
  })

  it(`should return an empty object if url is invalid`, () => {
    // Given
    const url = ''

    // When
    const params = extractQueryParams(url)

    // Then
    expect(params).toMatchObject({})
  })

  it(`should return an empty object if url is not defined`, () => {
    // Given
    const url = undefined

    // When
    const params = extractQueryParams(url)

    // Then
    expect(params).toMatchObject({})
  })
})
