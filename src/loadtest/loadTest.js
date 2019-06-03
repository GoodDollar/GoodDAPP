import './mock-browser'
import fs from 'fs'
import bip39 from 'bip39-light'
import faker from 'faker'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { GoodWallet } from '../lib/wallet/GoodWallet'
import { GoodWalletLogin } from '../lib/login/GoodWalletLogin'
import { UserStorage } from '../lib/gundb/UserStorage'
import Config from '../config/config'
import API from '../lib/API/api'
import logger from '../lib/logger/pino-logger'

// import range from 'lodash/range'

// const Timeout = () => {
//   return new Promise((res, rej) => {
//     setTimeout(res, 1000)
//   })
// }

const log = logger.child({ from: 'loadTest' })

const createReq = (id, jwt) => {
  let req = new FormData()
  const facemap = fs.createReadStream('./src/__tests__/facemap.zip', { contentType: 'application/zip' })
  const auditTrailImage = fs.createReadStream('./src/__tests__/face.png')
  req.append('sessionId', faker.random.number())
  req.append('facemap', facemap)
  req.append('auditTrailImage', auditTrailImage)
  req.append('enrollmentIdentifier', id)

  // log.info(req)
  return fetch(`${Config.serverUrl}/verify/facerecognition`, {
    method: 'POST',
    body: req,
    headers: { Authorization: `Bearer ${jwt}` }
  })
}

export const mytest = async () => {
  let mnemonic = bip39.generateMnemonic()
  let wallet = new GoodWallet({ mnemonic })
  await wallet.ready
  await API.ready
  let storage = new UserStorage(wallet)
  let login = new GoodWalletLogin(wallet, storage)
  await storage.ready
  let creds = await login.auth()
  log.info({ creds })
  var randomName = faker.name.findName() // Rowan Nikolaus
  var randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
  var randomCard = faker.phone.phoneNumber('+97250#######')
  log.info(randomCard, randomName, randomEmail)
  await API.addUser({ fullName: randomName, email: randomEmail, mobile: randomCard, walletAddress: wallet.account })
  let fr = await createReq(wallet.getAccountForType('zoomId'), creds.jwt)
  log.info(fr)
  setInterval(async () => {
    await global.gun.get('x').putAck({ z: 1 })
    log.info('pinging gun with ack')
  }, 30000)
}
for (let i = 0; i < 1; i++) {
  mytest()
}

// describe('load test', () => {
//   it('loadtest', async () => {
//     const doLogin = async () => {
//       let mnemonic = bip39.generateMnemonic()
//       let wallet = new GoodWallet({ mnemonic })
//       await wallet.ready
//       expect(wallet).toBeTruthy()
//       let login = new GoodWalletLogin(wallet)
//       let creds = await login.auth()
//       log.info({ creds })
//       return expect(creds).toBeTruthy()
//     }
//     let promises = range(3).map(i => doLogin())
//     await Promise.all(promises)
//   })
// })
