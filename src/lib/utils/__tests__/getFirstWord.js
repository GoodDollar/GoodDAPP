import { getFirstWord } from '../getFirstWord'

describe('getFirstWord', () => {
  const returnsEmptyString = [123, () => {}, {}, [], /^a sentence$/, /word/, '', '   ', '    .']
  const returnsFirstWord = [
    { value: ' John Doe', expected: 'John' },
    { value: 'John Doe', expected: 'John' },
    { value: 'John  Doe', expected: 'John' },
    { value: 'John', expected: 'John' },
    { value: '123 Doe', expected: '123' },
    { value: `${123}`, expected: '123' },
    { value: 'Ñandú Doe', expected: 'Ñandú' },
  ]

  returnsEmptyString.forEach(item => {
    it(`should return empty string if for "${item}"`, () => {
      const firstWord = getFirstWord(item)

      expect(firstWord).toEqual('')
    })
  })

  returnsFirstWord.forEach(({ value, expected }) => {
    it(`should return the first word for "${value}"`, () => {
      const firstWord = getFirstWord(value)

      expect(firstWord).toEqual(expected)
    })
  })
})
