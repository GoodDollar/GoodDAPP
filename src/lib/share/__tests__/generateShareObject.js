import { generateShareObject } from '../'

describe('generateShareObject', () => {
  it(`should return an object with structure: { title, text, url }`, () => {
    // Given
    const title = 'Sending GD via Good Dollar App'
    const text = 'You got GD. To withdraw open:'
    const url = 'https://example.com/myLink'

    // When
    const shareObject = generateShareObject(url)

    // Then
    expect(shareObject).toEqual({ title, text, url })
  })
})
