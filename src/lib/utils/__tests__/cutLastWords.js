import cutLastWords from '../cutLastWords'

describe('cutLastWords', () => {
  it('should cut correct amount of words', () => {
    const text = 'Hello beautiful world'

    const firstTest = cutLastWords(text, 1)
    const secondTest = cutLastWords(text, 2)

    expect(firstTest).toBe('Hello beautiful')
    expect(secondTest).toBe('Hello')
  })
})
