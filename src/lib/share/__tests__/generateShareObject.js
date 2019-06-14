import { generateShareObject } from '../'

describe('generateShareObject', () => {
  it(`should return an object with structure: { title, text, url }`, () => {
    // Given
    const title = 'Sending G$ via Good Dollar App'
    const text = 'You got G$. To withdraw open:'
    const url = 'https://example.com/myLink'

    // When
    const shareObject = generateShareObject(title, text, url)

    // Then
    expect(shareObject).toEqual({ title, text, url: encodeURI(url) })
  })
})
