import { generateReceiveShareObject } from '../index'

const isReceiveLink = Buffer.from(JSON.stringify({ amount: '123' })).toString('base64')
describe('generateReceiveShareObject', () => {
  it(`should return an object for receipt with code, amount, to and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const text = "Joe Bloggs, You've got a request from John Doe for 1 G$. To Transfer open:"

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, 100, 'Joe Bloggs', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.text).toBe(text)
    expect(shareObject.url).toMatch(isReceiveLink)
  })

  it(`should return an object for receipt with code, to and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const text = "Joe Bloggs, You've got a request from John Doe. To Transfer open:"

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, 0, 'Joe Bloggs', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.text).toBe(text)
    expect(shareObject.url).toMatch(isReceiveLink)
  })

  it(`should return an object for receipt with code, amount and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const text = "You've got a request from John Doe for 1 G$. To Transfer open:"

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, '100', '', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.text).toBe(text)
    expect(shareObject.url).toMatch(isReceiveLink)
  })

  it(`should return an object for receipt with code and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const text = "You've got a request from John Doe. To Transfer open:"

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, 0, '', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.text).toBe(text)
    expect(shareObject.url).toMatch(isReceiveLink)
  })
})
