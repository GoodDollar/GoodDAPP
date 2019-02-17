import { parsePhoneNumberFromString as parseMobile } from 'libphonenumber-js/mobile'

export default number => {
  const phoneNumber = parseMobile(number)
  return phoneNumber ? phoneNumber.isValid() : false
}
