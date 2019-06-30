// @flow
import gun from '../gundb'

import userStorage, { getOperationType, getReceiveDataFromReceipt, type TransactionEvent } from '../UserStorage'
import { getUserModel } from '../UserModel'
import { addUser } from './__util__/index'

const delay = duration => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration)
  })
}
let event = { id: 'xyz', date: new Date('2019-01-01T10:00:00.000Z').toString(), data: { foo: 'bar', unchanged: 'zar' } }
let event2 = { id: 'xyz2', date: new Date('2019-01-01T20:00:00.000Z').toString(), data: { foo: 'bar' } }
let event3 = { id: 'xyz3', date: new Date('2019-01-01T14:00:00.000Z').toString(), data: { foo: 'xar' } }
let mergedEvent = {
  id: 'xyz',
  date: new Date('2019-01-01').toString(),
  data: { foo: 'zar', unchanged: 'zar', extra: 'bar' }
}
let event4 = {
  id: 'xyz4',
  date: new Date('2019-01-02T10:00:00.000Z').toString(),
  data: { foo: 'bar', unchanged: 'zar' }
}

describe('UserStorage', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await userStorage.wallet.ready
    await userStorage.ready
  })

  afterEach(() => {
    userStorage.unSubscribeProfileUpdates()
  })

  it('logins to gundb', () => {
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
    userStorage.profile.get('x').put({ z: 2, y: 2 }, async () => {
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
    await userStorage.setProfileField('name', 'hadar2', 'public')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar2' }))
  })

  it('gets profile field', async () => {
    const gunRes = userStorage.getProfileField('name')
    const res = await gunRes.then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar2', value: expect.anything() }))
  })

  it('sets profile field private (encrypted)', async () => {
    await userStorage.setProfileField('id', 'z123', 'private')
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

  describe('gets profile name and avatar from value', () => {
    beforeAll(async () => {
      await addUser({
        identifier: 'abcdef',
        walletAddress: 'walletabcdef',
        fullName: 'Kevin Bardi',
        username: 'kvardi',
        mobile: '22233445566',
        email: 'kevin.bardi@altoros.com'
      })
      await addUser({
        identifier: 'ghijkl',
        walletAddress: 'walletghijkl',
        fullName: 'Fernando Greco',
        mobile: '22244556677',
        email: 'fernando.greco@altoros.com'
      })
      await addUser({
        identifier: 'mnopqr',
        walletAddress: 'walletmnopqr',
        fullName: 'Dario Miñones',
        mobile: '22255667788',
        email: 'dario.minones@altoros.com'
      })
    })

    it('returns object with user fullName for existing user identifier', async () => {
      const userProfile = await userStorage.getUserProfile('walletabcdef')
      expect(userProfile).toEqual(expect.objectContaining({ name: 'Kevin Bardi' }))
    })

    it("returns object with 'Unknown name' fullName for fake user identifier", async () => {
      const userProfile = await userStorage.getUserProfile('fake')
      expect(userProfile).toEqual(expect.objectContaining({ name: 'Unknown Name' }))
    })
  })

  // describe('generates standarised feed from events', () => {
  //   beforeAll(async () => {
  //     await addUser({
  //       identifier: 'abcdef',
  //       walletAddress: 'walletabcdef',
  //       fullName: 'Kevin Bardi',
  //       mobile: '22233445566',
  //       email: 'kevin.bardi@altoros.com'
  //     })
  //     await addUser({
  //       identifier: 'ghijkl',
  //       walletAddress: 'walletghijkl',
  //       fullName: 'Fernando Greco',
  //       mobile: '22244556677',
  //       email: 'fernando.greco@altoros.com'
  //     })
  //     await addUser({
  //       identifier: 'mnopqr',
  //       walletAddress: 'walletmnopqr',
  //       fullName: 'Dario Miñones',
  //       mobile: '22255667788',
  //       email: 'dario.minones@altoros.com'
  //     })

  //     const gunRes = await userStorage.updateFeedEvent(event)
  //     const index = await userStorage.feed
  //       .get('index')
  //       .once()
  //       .then()
  //   })
  //   it ('StandardizeFeed must return the feed with specific object structure', async () => {

  //   })
  // })

  it('sets profile email field masked', async () => {
    await userStorage.setProfileField('email', 'johndoe@blah.com', 'masked')
    const res = await userStorage.profile.get('email').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: 'j*****e@blah.com' }))
  })

  it('sets profile mobile field masked', async () => {
    await userStorage.setProfileField('mobile', '+972-50-7384928', 'masked')
    const res = await userStorage.profile.get('mobile').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('sets profile phone field masked', async () => {
    await userStorage.setProfileField('phone', '+972-50-7384928', 'masked')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('doesnt mask non email/phone profile fields', async () => {
    await userStorage.setProfileField('name', 'John Doe', 'masked')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'John Doe' }))
  })

  it('change profile field privacy to public', async () => {
    const result = await userStorage.setProfileField('phone', '+972-50-7384928', 'masked')
    expect(result).toMatchObject({ err: undefined })
    const before = await userStorage.profile.get('phone').then()
    expect(before).toMatchObject({ privacy: 'masked', display: '***********4928' })

    const gunRes = await userStorage.setProfileFieldPrivacy('phone', 'public')
    expect(gunRes).toMatchObject({ err: undefined })

    const after = await userStorage.profile.get('phone').then()
    expect(after).toMatchObject({ privacy: 'public', display: '+972-50-7384928' })
  })

  it('change profile field privacy to private', async () => {
    await userStorage.setProfileFieldPrivacy('phone', 'private')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '' }))
  })

  it('add event', async () => {
    await userStorage.updateFeedEvent(event)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.getAllFeed()
    expect(index).toHaveProperty('2019-01-01')
    expect(events).toContainEqual(event)
  })

  it('add second event', async () => {
    await userStorage.updateFeedEvent(event)
    await userStorage.updateFeedEvent(event2)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.getAllFeed()
    expect(index['2019-01-01']).toBeGreaterThanOrEqual(2)
    expect(events).toContainEqual(event2)
    expect(events).toContainEqual(event)
  })

  it('updates first event', async () => {
    await userStorage.updateFeedEvent(event)
    await delay(0)
    let updatedEvent = {
      ...event,
      date: new Date('2019-01-01').toString(),
      data: { foo: 'updates first event', extra: 'bar' }
    }
    await userStorage.updateFeedEvent(updatedEvent)
    await delay(100)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.getAllFeed()
    expect(index['2019-01-01']).toBeGreaterThanOrEqual(1)
    expect(events).toContainEqual(updatedEvent)
  })

  it('add middle event', async () => {
    await userStorage.updateFeedEvent(mergedEvent)
    await userStorage.updateFeedEvent(event2)
    await userStorage.updateFeedEvent(event3)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.getAllFeed()
    expect(index['2019-01-01']).toBeGreaterThanOrEqual(3)
    expect([event2, event3, mergedEvent]).toEqual(expect.arrayContaining(events))
  })

  it('keeps event index sorted', async () => {
    await userStorage.updateFeedEvent(event4)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.feed.get('2019-01-02').then()
    expect(index['2019-01-02']).toEqual(1)
    expect(events.map(event => event.id)).toEqual([event4.id])
  })

  it('gets events first page', async () => {
    const gunRes = await userStorage.getFeedPage(2)
    expect(gunRes.length).toEqual(4)
  })

  it('gets events second page', async () => {
    const gunRes = await userStorage.getFeedPage(2)
    expect(gunRes.length).toEqual(0)
  })

  it('resets cursor and get events single day page', async () => {
    const gunRes = await userStorage.getFeedPage(1, true)
    expect(gunRes.length).toEqual(1)
  })

  it('add TransactionEvent event', async () => {
    const date = '2020-01-01'
    const transactionEvent: TransactionEvent = {
      id: 'xyz32',
      date: new Date(date).toString(),
      type: 'send',
      data: {
        to: 'Mike',
        reason: 'For the pizza',
        amount: 3,
        sendLink: 'http://fake.link/string',
        receipt: { foo: 'foo', blockNumber: 123 }
      }
    }
    await userStorage.updateFeedEvent(transactionEvent)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.getAllFeed()
    expect(index).toHaveProperty(date)
    expect(events).toContainEqual(transactionEvent)
  })

  it('should subscribe to profile updates', async done => {
    let updates = [
      userStorage.setProfileField('email', 'johndoe@blah.com', 'masked'),
      userStorage.setProfileField('name', 'hadar2', 'public'),
      userStorage.setProfileField('id', 'z123', 'private')
    ]
    await Promise.all(updates)

    userStorage.subscribeProfileUpdates(profile => {
      expect(profile.email.display).toEqual('j*****e@blah.com')
      expect(profile.name.display).toEqual('hadar2')
      expect(profile.id.display).toEqual('')
      done()
    })
  })

  it('set indexable field as empty should throw an error', async () => {
    const response = await userStorage.setProfileField('mobile', '', 'public')
    expect(response).toMatchObject({ err: 'Indexable field cannot be null or empty' })
  })

  it('gets display profile', async done => {
    let updates = [
      userStorage.setProfileField('x', '', 'public'),
      userStorage.setProfileField('mobile', '+22222222222', 'public'),
      userStorage.setProfileField('phone', '+22222222222', 'public'),
      userStorage.setProfileField('email', 'johndoe@blah.com', 'masked'),
      userStorage.setProfileField('name', 'hadar2', 'public'),
      userStorage.setProfileField('id', 'z123', 'private')
    ]

    await Promise.all(updates)
    userStorage.subscribeProfileUpdates(profile => {
      const { isValid, getErrors, validate, ...displayProfile } = userStorage.getDisplayProfile(profile)
      expect(displayProfile).toEqual({
        id: '',
        name: 'hadar2',
        email: 'j*****e@blah.com',
        phone: '+22222222222',
        mobile: '+22222222222',
        x: ''
      })
      done()
    })
  })

  it('gets private profile', async done => {
    let updates = [
      userStorage.setProfileField('x', '', 'public'),
      userStorage.setProfileField('mobile', '+22222222222', 'public'),
      userStorage.setProfileField('phone', '+22222222222', 'public'),
      userStorage.setProfileField('email', 'johndoe@blah.com', 'masked'),
      userStorage.setProfileField('name', 'hadar2', 'public'),
      userStorage.setProfileField('id', 'z123', 'private')
    ]
    await Promise.all(updates)
    await userStorage.subscribeProfileUpdates(profile => {
      userStorage.getPrivateProfile(profile).then(result => {
        const { isValid, getErrors, validate, ...privateProfile } = result

        expect(privateProfile).toEqual({
          id: 'z123',
          name: 'hadar2',
          email: 'johndoe@blah.com',
          phone: '+22222222222',
          mobile: '+22222222222',
          x: ''
        })
        done()
      })
    })
  })

  it('update profile field uses privacy settings', async done => {
    // Making sure that privacy default is not override in other tests
    let updates = [
      userStorage.setProfileField('fullName', 'Old Name', 'public'),
      userStorage.setProfileField('mobile', '+22222222211', 'masked'),
      userStorage.setProfileField('email', 'new@domain.com', 'masked')
    ]
    await delay(200)
    await Promise.all(updates)
    const profileData = {
      fullName: 'New Name',
      email: 'new@email.com',
      mobile: '+22222222222',
      username: 'hadar2'
    }
    const profile = getUserModel(profileData)
    const result = await userStorage.setProfile(profile)
    expect(result).toBe(true)
    await delay(500)
    userStorage.subscribeProfileUpdates(async updatedProfile => {
      await userStorage.getPrivateProfile(updatedProfile).then(result => {
        const { isValid, getErrors, validate, ...privateProfile } = result
        expect(privateProfile).toMatchObject(profileData)
      })
      const { isValid, getErrors, validate, ...displayProfile } = userStorage.getDisplayProfile(updatedProfile)
      expect(displayProfile).toMatchObject({
        fullName: 'New Name',
        email: 'n*w@email.com',
        mobile: '********2222',
        username: 'hadar2'
      })
      done()
    })
  })

  it(`update profile doesn't change privacy settings`, async done => {
    const email = 'johndoe@blah.com'
    await userStorage.setProfileField('email', email, 'public')
    await userStorage.setProfile(getUserModel({ email, fullName: 'full name', mobile: '+22222222222' }))
    userStorage.subscribeProfileUpdates(updatedProfile => {
      const result = userStorage.getDisplayProfile(updatedProfile)
      expect(result.email).toBe(email)
      done()
    })
  })

  it(`update username success`, async () => {
    await Promise.all([userStorage.wallet.ready, userStorage.ready])
    const result = await userStorage.setProfileField('username', 'user1', 'public')
    await userStorage.setProfileField('email', 'user1', 'public')
    expect(result).toMatchObject({ err: undefined, ok: 0 })

    const updatedUsername = await userStorage.getProfileFieldValue('username')
    expect(updatedUsername).toBe('user1')
  })

  it(`update username with setProfile should not update profile if username is taken`, async () => {
    const profileModel = getUserModel({
      fullName: 'New Name',
      email: 'new@email.com',
      mobile: '+22222222222',
      username: 'notTaken'
    })
    await gun
      .get(`users/byusername`)
      .get('taken')
      .putAck('taken')
    const result = await userStorage.setProfile(profileModel)
    expect(result).toBe(true)

    try {
      await userStorage.setProfile({
        ...profileModel,
        username: 'taken',
        email: 'diferent@email.com',
        mobile: '+22222222221'
      })
    } catch (e) {
      expect(e).toEqual(new Error(['Existing index on field username']))
    }
    const updated = await userStorage.getProfile()
    expect(updated.username).toBe('notTaken')
    expect(updated.email).toBe('diferent@email.com')
  })

  it(`update username with used username should fail`, async () => {
    //take a username
    await gun
      .get(`users/byusername`)
      .get('taken')
      .putAck('taken')
    const newResult = await userStorage.setProfileField('username', 'taken', 'public')
    expect(newResult).toMatchObject({ err: 'Existing index on field username', ok: 0 })
    const updatedUsername = await userStorage.getProfileFieldValue('username')
    expect(updatedUsername).not.toBe('taken')
    const newResultOk = await userStorage.setProfileField('username', 'user3', 'public')
    expect(newResultOk).toMatchObject({ err: undefined })
    const updatedUsernameOk = await userStorage.getProfileFieldValue('username')
    expect(updatedUsernameOk).toBe('user3')
  })

  describe('getReceiveDataFromReceipt', () => {
    it('get Transfer data from logs', () => {
      const receipt = {
        logs: [
          {
            name: 'Transfer',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '15' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          }
        ]
      }
      const result = getReceiveDataFromReceipt(receipt)
      expect(result).toMatchObject({
        from: '0x7aa689d96362de59b78c2f184f840dbdab9270e0',
        to: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d',
        value: '15'
      })
    })

    it('get PaymentWithdraw data from logs', () => {
      const receipt = {
        logs: [
          {
            name: 'Transfer',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '15' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          },
          {
            name: 'PaymentWithdraw',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '15' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          }
        ]
      }
      const result = getReceiveDataFromReceipt(receipt)
      expect(result).toMatchObject({
        from: '0x7aa689d96362de59b78c2f184f840dbdab9270e0',
        to: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d',
        value: '15'
      })
    })

    it('get Transfer when multiple Transfer should get the bigger (the lastone)', () => {
      const receipt = {
        logs: [
          {
            name: 'Transfer',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '15' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          },
          {
            name: 'Transfer',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '1500' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          }
        ]
      }
      const result = getReceiveDataFromReceipt(receipt)
      expect(result).toMatchObject({
        from: '0x7aa689d96362de59b78c2f184f840dbdab9270e0',
        to: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d',
        value: '1500'
      })
    })

    it('get Transfer when multiple Transfer should get the bigger (the firstone)', () => {
      const receipt = {
        logs: [
          {
            name: 'Transfer',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '20' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          },
          {
            name: 'Transfer',
            events: [
              { name: 'from', type: 'address', value: '0x7aa689d96362de59b78c2f184f840dbdab9270e0' },
              { name: 'to', type: 'address', value: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d' },
              { name: 'value', type: 'uint256', value: '1' }
            ],
            address: '0x88ceB1769E0F8304b9981F0CB23C3192361d6873'
          }
        ]
      }
      const result = getReceiveDataFromReceipt(receipt)
      expect(result).toMatchObject({
        from: '0x7aa689d96362de59b78c2f184f840dbdab9270e0',
        to: '0x90e5c2433a1fbab3c9d350bcffe2e73ac479941d',
        value: '20'
      })
    })

    it('empty logs should return empty object', () => {
      const receipt = {
        logs: []
      }
      const result = getReceiveDataFromReceipt(receipt)
      expect(result).toMatchObject({})
    })

    it('empty receipt should return empty object', () => {
      const receipt = {}
      const result = getReceiveDataFromReceipt(receipt)
      expect(result).toMatchObject({})
    })
  })
})

describe('getOperationType', () => {
  it('PaymentWithdraw should be withdraw', () => {
    const event = {
      name: 'PaymentWithdraw'
    }
    expect(getOperationType(event, 'account1')).toBe('withdraw')
  })

  it('PaymentWithdraw with any from should be withdraw', () => {
    const event = {
      name: 'PaymentWithdraw',
      from: 'account1'
    }
    expect(getOperationType(event, 'account1')).toBe('withdraw')
  })

  it('from equal to account should be send', () => {
    const event = {
      name: 'Transfer',
      from: 'account1'
    }
    expect(getOperationType(event, 'account1')).toBe('send')
  })

  it('from different to account should be receive', () => {
    const event = {
      name: 'Transfer',
      from: 'account2'
    }
    expect(getOperationType(event, 'account1')).toBe('receive')
  })
})

describe('getOperationType', () => {
  it('PaymentWithdraw should be withdraw', () => {
    const event = {
      name: 'PaymentWithdraw'
    }
    expect(getOperationType(event, 'account1')).toBe('withdraw')
  })

  it('PaymentWithdraw with any from should be withdraw', () => {
    const event = {
      name: 'PaymentWithdraw',
      from: 'account1'
    }
    expect(getOperationType(event, 'account1')).toBe('withdraw')
  })

  it('from equal to account should be send', () => {
    const event = {
      name: 'Transfer',
      from: 'account1'
    }
    expect(getOperationType(event, 'account1')).toBe('send')
  })

  it('from different to account should be receive', () => {
    const event = {
      name: 'Transfer',
      from: 'account2'
    }
    expect(getOperationType(event, 'account1')).toBe('receive')
  })
})

describe('users index', () => {
  const unavailableProfile = {
    email: 'username@unavailable.com',
    mobile: '22222222220',
    username: 'unavailable'
  }
  beforeAll(async done => {
    await userStorage.wallet.ready
    await userStorage.ready

    const gunUser = gun.user()
    gunUser.create('fakeuser', 'fakeuser', () => {
      gunUser.auth('fakeuser', 'fakeuser', async () => {
        await gunUser.get('profile').putAck(unavailableProfile)
        await gun
          .get('users/byemail')
          .get(unavailableProfile.email)
          .putAck(gunUser.get('profile'))
        await gun
          .get('users/bymobile')
          .get(unavailableProfile.mobile)
          .putAck(gunUser.get('profile'))
        await gun
          .get('users/byusername')
          .get(unavailableProfile.username)
          .putAck(gunUser.get('profile'))

        await userStorage.init()
        done()
      })
    })
  })

  it('should return user address by public email', async () => {
    let wallet = userStorage.wallet.account
    await userStorage.setProfileField('walletAddress', wallet)
    await userStorage.setProfileField('email', 'test@test.com', 'public')
    let addr = await userStorage.getUserAddress('test@test.com')
    expect(addr).toBe(wallet)
  })

  it('isValidValue should return true', async () => {
    const isValidValue = await userStorage.isValidValue('email', 'test@test.com')
    expect(isValidValue).toBeTruthy()
  })

  it('validateProfile should return isValid=true', async () => {
    const { isValid, errors } = await userStorage.validateProfile({ email: 'test@test.com' })
    expect(isValid).toBeTruthy()
    expect(errors).toEqual({})
  })

  it('validateProfile should return isValid=false when not profile provided', async () => {
    const { isValid, errors } = await userStorage.validateProfile()
    expect(isValid).toBeFalsy()
    expect(errors).toEqual({})
  })

  it('validateProfile should return isValid=false when field is being used', async () => {
    expect(await userStorage.isValidValue('email', unavailableProfile.email)).toBeFalsy()
    expect(await userStorage.isValidValue('mobile', unavailableProfile.mobile)).toBeFalsy()
    expect(await userStorage.isValidValue('username', unavailableProfile.username)).toBeFalsy()
  })

  it('validateProfile should return isValid=false when field is being used and error only in that field', async () => {
    const { isValid, errors } = await userStorage.validateProfile({
      email: unavailableProfile.email,
      username: 'newUsername'
    })
    expect(isValid).toBeFalsy()
    expect(errors).toEqual({ email: 'Unavailable email' })
  })
})
