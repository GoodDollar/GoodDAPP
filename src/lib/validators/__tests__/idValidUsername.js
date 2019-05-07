import isValidUsername from '../isValidUsername'

describe('isValidUsername', () => {
  // Given
  const testCases = [
    { username: '', validity: true },
    { username: '_', validity: true },
    { username: 'username', validity: true },
    { username: 'Username', validity: true },
    { username: 'Username123', validity: true },
    { username: 'Username_123', validity: true },
    { username: 'username_123', validity: true },
    { username: '__username__', validity: true },
    { username: 'username-123', validity: false },
    { username: 'username@123', validity: false },
    { username: '@', validity: false }
  ]

  testCases.forEach(({ username, validity }) => {
    it(`should consider ${username} as ${validity ? 'VALID' : 'INVALID'}`, () => {
      // When
      const result = isValidUsername(username)

      // Then
      expect(result).toBe(validity)
    })
  })
})
