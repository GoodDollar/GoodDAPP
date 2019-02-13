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

  it('sets gundb field', async () => {
    const res = await userStorage.profile
      .get('x')
      .put({ z: 1, y: 1 })
      .then()
    expect(res).toEqual(expect.objectContaining({ z: 1, y: 1 }))
  })

  it('updates gundb field', done => {
    const gunRes = userStorage.profile.get('x').put({ z: 2, y: 2 }, async v => {
      let res = await userStorage.profile.get('x').then()
      expect(res).toEqual(expect.objectContaining({ z: 2, y: 2 }))
      done()
    })
  })

  it('sets profile field', async () => {
    await userStorage.setProfileField('name', 'hadar', 'public')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar' }))
  })

  it('update profile field', async () => {
    const ack = await userStorage.setProfileField('name', 'hadar2', 'public')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar2' }))
  })

  it('gets profile field', async () => {
    const gunRes = userStorage.getProfileField('name')
    const res = await gunRes.then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar2', value: expect.anything() }))
  })

  it('sets profile field private (encrypted)', async () => {
    const gunRes = await userStorage.setProfileField('id', 'z123', 'private')
    const res = await userStorage.profile.get('id').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '' }))
  })

  it('profile field private is encrypted', async () => {
    const res = await userStorage.profile
      .get('id')
      .get('value')
      .then()
    expect(Object.keys(res)).toEqual(['ct', 'iv', 's'])
  })

  it('gets profile field private (decrypted)', async () => {
    const gunRes = userStorage.getProfileFieldValue('id')
    const res = await gunRes.then()
    expect(res).toEqual('z123')
  })

  it('sets profile email field masked', async () => {
    const gunRes = await userStorage.setProfileField('email', 'johndoe@blah.com', 'masked')
    const res = await userStorage.profile.get('email').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: 'j*****e@blah.com' }))
  })

  it('sets profile mobile field masked', async () => {
    const gunRes = await userStorage.setProfileField('mobile', '+972-50-7384928', 'masked')
    const res = await userStorage.profile.get('mobile').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('sets profile phone field masked', async () => {
    const gunRes = await userStorage.setProfileField('phone', '+972-50-7384928', 'masked')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('doesnt mask non email/phone profile fields', async () => {
    const gunRes = await userStorage.setProfileField('name', 'John Doe', 'masked')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: 'John Doe' }))
  })

  it('change profile field privacy to public', async () => {
    const gunRes = await userStorage.setProfileFieldPrivacy('phone', 'public')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: '+972-50-7384928' }))
  })

  it('change profile field privacy to private', async () => {
    const gunRes = await userStorage.setProfileFieldPrivacy('phone', 'private')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '' }))
  })

})
