import userStorage from '../../../lib/gundb/UserStorage'

describe('Check W3 Login Token Save', () => {
  it('should save login token', async () => {
    const token = Array(100)
      .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
      .map(function(x) {
        return x[Math.floor(Math.random() * x.length)]
      })
      .join('')

    await userStorage.ready

    userStorage.setProfileField('loginToken', token, 'private')

    const savedPrivateTokenValue = await userStorage.getProfileField('loginToken')
    const savedTokenValue = await userStorage.getProfileFieldValue('loginToken')

    expect(savedTokenValue).toBe(token)
    expect(savedPrivateTokenValue.display).toBe('******')
  })
})
