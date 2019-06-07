import { ERROR_MESSAGE, validateFullName } from '../validateFullName'

describe('validations', () => {
  it(`should fail if fullName is empty`, () => {
    // Given
    const fullName = ''

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage !== '').toBeTruthy()
  })

  it(`should fail if fullName contains numbers`, () => {
    // Given
    const fullName = 'John3 Doe'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage !== '').toBeTruthy()
  })

  it(`should fail if name or last name are missing`, () => {
    // Given
    const fullName = 'John'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage !== '').toBeTruthy()
  })

  it(`should fail if name is less than 2 chars long`, () => {
    // Given
    const fullName = 'J Doe'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage !== '').toBeTruthy()
  })

  it(`should fail if last name is less than 2 chars long`, () => {
    // Given
    const fullName = 'John D'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage !== '').toBeTruthy()
  })

  it(`should pass if first name and last name have more than 2 chars long and they only have characters`, () => {
    // Given
    const fullName = 'John Doe'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage !== '').toBeFalsy()
  })
})

describe('error messages', () => {
  it(`should fail if fullName is empty`, () => {
    // Given
    const fullName = ''

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage).toBe(ERROR_MESSAGE.EMPTY)
  })

  it(`should fail if fullName contains numbers`, () => {
    // Given
    const fullName = 'John3 Doe'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage).toBe(ERROR_MESSAGE.ONLY_LETTERS)
  })

  it(`should fail if name or last name are missing`, () => {
    // Given
    const fullName = 'John'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage).toBe(ERROR_MESSAGE.FULL_NAME)
  })

  it(`should fail if name is less than 2 chars long`, () => {
    // Given
    const fullName = 'J Doe'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage).toBe(ERROR_MESSAGE.FULL_NAME)
  })

  it(`should fail if last name is less than 2 chars long`, () => {
    // Given
    const fullName = 'John D'

    // When
    const errorMessage = validateFullName(fullName)

    // Then
    expect(errorMessage).toBe(ERROR_MESSAGE.FULL_NAME)
  })
})
