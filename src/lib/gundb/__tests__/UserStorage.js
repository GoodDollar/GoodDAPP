import Gun from 'gun'
import decrypt from '../gundb-decrypt'

let userStorage = require('../UserStorage.js').default
describe('UserStorage', () => {
  beforeAll(async () => {
    global.gun = Gun()
    jest.setTimeout(30000)
    await userStorage.wallet.ready
    console.debug('wallet ready...')
    await userStorage.ready
    console.log('storage ready...')
  })

  it('logins to gundb', async () => {
    expect(userStorage.user).not.toBeUndefined()
  })

  it('sets profile field', async () => {
    const gunRes = userStorage.setProfileField('name', 'hadar', 'public')
    const res = await gunRes.then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar' }))
  })

  it('gets profile field', async () => {
    const gunRes = userStorage.getProfileField('name')
    const res = await gunRes.then()
    expect(res).toEqual('hadar')
  })

  it('sets profile field private (encrypted)', async () => {
    const gunRes = userStorage.setProfileField('id', 'z123', 'private')
    const res = await gunRes.then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '' }))
  })

  it('gets profile field private (decrypted)', async () => {
    const gunRes = userStorage.getProfileField('id')
    const res = await gunRes.then()
    expect(res).toEqual('z123')
  })
})
