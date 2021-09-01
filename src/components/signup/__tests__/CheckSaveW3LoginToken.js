// eslint-disable-next-line import/order
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import userStorage from '../../../lib/userStorage/UserStorage'

jest.setTimeout(20000)

describe('Check W3 Login Token Save', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('should save login token', async () => {
    const token = Array(100)
      .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
      .map(function(x) {
        return x[Math.floor(Math.random() * x.length)]
      })
      .join('')

    await userStorage.setProfileField('loginToken', token, 'private')

    const savedDisplayTokenValue = userStorage.getProfileFieldDisplayValue('loginToken')
    const savedTokenValue = userStorage.getProfileFieldValue('loginToken')

    expect(savedTokenValue).toBe(token)
    expect(savedDisplayTokenValue).toBe('******')
  })
})
