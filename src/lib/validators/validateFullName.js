// @flow
export const validateFullName = (fullName: string) => {
  if (fullName.length === 0) {
    return ERROR_MESSAGE.EMPTY
  } else if (/\d+/.test(fullName)) {
    return ERROR_MESSAGE.ONLY_LETTERS
  } else if (fullName.match(/\w{2,} \w{2,}/) == null) {
    return ERROR_MESSAGE.FULL_NAME
  }

  return ''
}

export const ERROR_MESSAGE = {
  EMPTY: 'Field must not be empty',
  ONLY_LETTERS: 'A-Z letter only, no numbers, no symbols.',
  FULL_NAME: 'Please add first and last name',
}
