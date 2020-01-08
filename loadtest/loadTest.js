/**
 *
 * NEED TO COMMENT in utils.js import { MaskService } from 'react-native-masked-text'
 * it causes issues in running this in react >=0.59.0
 *
 */
import './mock-browser'
import fs from 'fs'
import bip39 from 'bip39-light'
import faker from 'faker'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { GoodWallet } from '../src/lib/wallet/GoodWalletClass'
import { GoodWalletLogin } from '../src/lib/login/GoodWalletLogin'
import { UserStorage } from '../src/lib/gundb/UserStorageClass'
import Config from '../src/config/config'
import API from '../src/lib/API/api'
const Timeout = (timeout = 3000) => {
  return new Promise((res, rej) => {
    setTimeout(res, timeout)
  })
}
let failedTests = {}
const createReq = (id, jwt) => {
  let req = new FormData()
  const facemap = fs.createReadStream('./loadtest/facemap.zip', { contentType: 'application/zip' })
  const auditTrailImage = fs.createReadStream('./loadtest/face.png')
  req.append('sessionId', faker.random.number())
  req.append('facemap', facemap)
  req.append('auditTrailImage', auditTrailImage)
  req.append('enrollmentIdentifier', id)
  return fetch(`${Config.serverUrl}/verify/facerecognition`, {
    method: 'POST',
    body: req,
    headers: { Authorization: `Bearer ${jwt}` },
  })
}

export const mytest = async i => {
  try {
    const gun = global.Gun({
      localStorage: true,
      file: './loadtest/' + i + '.json',
      peers: [`${Config.serverUrl}/gun`],
    })
    let mnemonic = bip39.generateMnemonic()
    let wallet = new GoodWallet({ mnemonic })
    await wallet.ready
    await API.ready
    let storage = new UserStorage(wallet, gun)
    let login = new GoodWalletLogin(wallet, storage)
    await storage.ready
    let creds = await login.auth()

    // console.info({ creds })
    var randomName = faker.name.findName() // Rowan Nikolaus
    var randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
    var randomCard = faker.phone.phoneNumber('+97250#######')

    // console.info(randomCard, randomName, randomEmail)
    let adduser = await Promise.race([
      Timeout(20000).then(x => {
        throw new Error('adduser timeout')
      }),
      API.addUser({
        fullName: randomName,
        email: randomEmail,
        mobile: randomCard,
        walletAddress: wallet.account,
      }),
    ])
    console.info('/user/add:', adduser.data)
    if (adduser.data.ok !== 1) {
      throw new Error('adduser failed')
    }
    await storage.setProfile({
      fullName: randomName,
      email: randomEmail,
      mobile: randomCard,
      walletAddress: wallet.account,
    })
    let fr = await Promise.race([
      Timeout(20000).then(x => {
        throw new Error('FR timeout')
      }),
      createReq(wallet.getAccountForType('zoomId'), creds.jwt).then(r => r.json()),
    ])

    console.info('/verify/facerecognition:', fr)
    if (fr.ok !== 1) {
      throw new Error(`FR failed`)
    }
    let gunres = 0
    await new Promise((res, rej) => {
      gun.get('users/byemail').once(r => {
        if (r && r.err) {
          rej(new Error(r.err))
        }
        if (!r) {
          rej(new Error('Empty gun data'))
        } else if (++gunres === 1) {
          res()
        }
      })

      //   // gun.get('users/bymobile').open(r => {
      //   //   if (r.err) rej(new Error(r.err))
      //   //   else if (++gunres === 2) res()
      //   // })
      //   //   gun.get('users/bywalletAddress').open(r => {
      //   //     if (r.err) rej(new Error(r.err))
      //   //     else if (++gunres === 3) res()
      //   //   })
    })
  } catch (error) {
    console.info(`Test failed`, error)
    failedTests[error.message] === undefined ? (failedTests[error.message] = 1) : (failedTests[error.message] += 1)
  } finally {
    // fs.unlinkSync('./loadtest/loadtest' + i + '.json')
  }
}
const run = async numTests => {
  let promises = []
  for (let i = 0; i < numTests; i++) {
    promises[i] = mytest(i)
    // eslint-disable-next-line no-await-in-loop
    await Timeout(1000)
  }
  console.info('Waiting for tests to finish...')
  await Promise.all(promises)
  console.info('Done running tests', { total: promises.length, failedTests })
  console.info('Waiting for server memory stats')
  await Timeout(5000)
  console.info('Done. Quiting')
  process.exit(-1)
}
let numTests = process.argv[2]
console.info('arrgs', process.argv, numTests)
run(numTests)

// describe('load test', () => {
//   it('loadtest', async () => {
//     const doLogin = async () => {
//       let mnemonic = bip39.generateMnemonic()
//       let wallet = new GoodWallet({ mnemonic })
//       await wallet.ready
//       expect(wallet).toBeTruthy()
//       let login = new GoodWalletLogin(wallet)
//       let creds = await login.auth()
//       console.info({ creds })
//       return expect(creds).toBeTruthy()
//     }
//     let promises = range(3).map(i => doLogin())
//     await Promise.all(promises)
//   })
// })
