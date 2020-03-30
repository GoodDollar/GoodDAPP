import { generateShareObject } from '../'

describe('generateShareObject', () => {
  it(`should return an object with structure: { title, message, url }`, () => {
    // Given
    const title = 'Sending G$ via Good Dollar App'
    const message = 'You got G$. To withdraw open:'
    const url = 'https://example.com/myLink'

    // When
    const shareObject = generateShareObject(title, message, url)

    // Then
    expect(shareObject).toEqual({ title, message, url: encodeURI(url) })
  })
})
