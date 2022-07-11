import { defaultErrorMessage, getErrorMessage } from '../utils'

describe('API', () => {
  describe('getErrorMessage', () => {
    const message = 'Test error message'

    it('should parse string', () => expect(getErrorMessage(message)).toEqual(message))

    it('should parse JS error', () => {
      const error = new Error(message)

      expect(getErrorMessage(error)).toEqual(message)
    })

    it('should parse { ok, error } shape', () => {
      const error = { ok: 0, error: message }

      expect(getErrorMessage(error)).toEqual(message)
    })

    it('should parse { ok, message } shape', () => {
      const error = { ok: 0, message }

      expect(getErrorMessage(error)).toEqual(message)
    })

    it('should return default message in other cases', () => {
      ;[null, undefined, new Error(), {}].forEach(error => expect(getErrorMessage(error)).toEqual(defaultErrorMessage))
    })
  })
})
