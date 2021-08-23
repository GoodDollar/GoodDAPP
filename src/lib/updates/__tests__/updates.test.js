// @flow
import Config from '../../../config/config'
import userStorage from '../../userStorage/UserStorage'
import update from '../index'

jest.setTimeout(30000)

describe('Updates', () => {
  beforeAll(async () => {})

  it('check updates', async () => {
    const updatesDataBefore = (await userStorage.userProperties.get('updates')) || {}
    expect(updatesDataBefore.lastUpdate).toBeUndefined()
    expect(updatesDataBefore.lastVersionUpdate).toBeUndefined()
    expect(updatesDataBefore.status).toBeUndefined()

    await update()

    const updatesDataAfter = (await userStorage.userProperties.get('updates')) || {}
    expect(typeof updatesDataAfter.lastUpdate === 'string').toBeTruthy()
    expect(updatesDataAfter.lastVersionUpdate).toEqual(Config.version)
    expect(typeof updatesDataAfter.status === 'object').toBeTruthy()
  })
})
