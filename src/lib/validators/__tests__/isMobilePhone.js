import isMobilePhone from '../isMobilePhone'

describe('is mobile phone validation', () => {
  it(`should fail if mobile phone is empty`, () => {
    // Given
    const phone = ''

    // When
    const isValid = isMobilePhone(phone)

    // Then
    expect(isValid).toBeFalsy()
  })

  it(`should fail if receive an email`, () => {
    // Given
    const phone = 'kevin.bardi@altoros.com'

    // When
    const isValid = isMobilePhone(phone)

    // Then
    expect(isValid).toBeFalsy()
  })

  it(`should word if receive a mobile phone`, () => {
    // Given
    const phone = '+222 22 33 44 55'

    // When
    const isValid = isMobilePhone(phone)

    // Then
    expect(isValid).toBeTruthy()
  })
})
