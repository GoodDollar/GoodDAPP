import isEmail from 'validator/lib/isEmail'

export default value => isEmail(value, { allow_utf8_local_part: false })
