import { generateReceiveShareObject, generateShareLink } from '../'

const isReceiveLink = generateShareLink('receive', { amount: '123' })
describe('generateReceiveShareObject', () => {
  it(`should return an object for receipt with code, amount, to and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const message = "Joe Bloggs, You've got a request from John Doe for 100 G$. To approve transfer open: "

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, 100, 'Joe Bloggs', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.message).toBe(message)
    expect(shareObject.url).toMatch(isReceiveLink)
  })

  it(`should return an object for receipt with code, to and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const message = "Joe Bloggs, You've got a request from John Doe. To approve transfer open: "

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, 0, 'Joe Bloggs', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.message).toBe(message)
    expect(shareObject.url).toMatch(isReceiveLink)
  })

  it(`should return an object for receipt with code, amount and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const message = "You've got a request from John Doe for 100 G$. To approve transfer open: "

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, '100', '', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.message).toBe(message)
    expect(shareObject.url).toMatch(isReceiveLink)
  })

  it(`should return an object for receipt with code and from`, () => {
    // Given
    const title = 'Sending G$ via GoodDollar App'
    const message = "You've got a request from John Doe. To approve transfer open: "

    // When
    const shareObject = generateReceiveShareObject({ amount: '123' }, 0, '', 'John Doe')

    // Then
    expect(shareObject.title).toBe(title)
    expect(shareObject.message).toBe(message)
    expect(shareObject.url).toMatch(isReceiveLink)
  })
})
