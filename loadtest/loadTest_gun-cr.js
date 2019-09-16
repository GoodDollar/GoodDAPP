import './mock-browser'
import bip39 from 'bip39-light'
import faker from 'faker'
import { GoodWallet } from '../src/lib/wallet/GoodWalletClass'
import { GoodWalletLogin } from '../src/lib/login/GoodWalletLogin'
import { UserStorage } from '../src/lib/gundb/UserStorageClass'
import delay from 'delay'
import API from '../src/lib/API/api'
import Config from "../src/config/config"
let failedTests = {}

const addUser = async (i) => {
  let result = {
    addTime: 0,
    getTime: 0,
  }

  try {
     const gun = global.Gun({
       peers: [`${Config.gunPublicUrl}`],
       multicast: false,
       axe: true,
     })
    let mnemonic = bip39.generateMnemonic()
    let wallet = new GoodWallet({ mnemonic })
    console.log('#############################################')
    console.log('wallet.ready')
    await wallet.ready
    console.log('#############################################')
    console.log('#############################################')
    console.log('API.ready')
    await API.ready
    console.log('#############################################')
    const storage = new UserStorage(wallet,  gun)
    console.log('#############################################')
    console.log('storage.ready')
    await storage.ready
    console.log('#############################################')
    const randomName = faker.name.findName() // Rowan Nikolaus
    const randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
    const randomCard = faker.phone.phoneNumber('+38097#######')
    let login = new GoodWalletLogin(wallet, storage)
    console.log('#############################################')
    console.log('login.auth()')
    console.log('#############################################')
    let creds = await login.auth()
    let userData = {
      fullName: randomName,
      email: randomEmail,
      mobile: randomCard,
      walletAddress: wallet.account,
    }
  
    console.log('#############################################')
    console.log('storage.setProfile(userData)')
    console.log('#############################################')
    const startTimeForSave = new Date().getTime()
    await storage.setProfile(userData)
    const endTimeForSave = new Date().getTime()
    result.addTime = endTimeForSave - startTimeForSave
  
    
    console.log('#############################################')
    console.log('storage.getProfileFieldValue(userData)')
    console.log('#############################################')
    const startTimeForGet = new Date().getTime()
    const mm = await storage.getProfileFieldValue('email')
    const endTimeForGet = new Date().getTime()
    result.getTime = endTimeForGet - startTimeForGet
    
    
  } catch (error) {
    console.info(`Test failed`, error)
    failedTests[error.message] === undefined ? (failedTests[error.message] = 1) : (failedTests[error.message] += 1)
    return result
  } finally {
    // fs.unlinkSync('./loadtest/loadtest' + i + '.json')
  }
  
  return result
}

const run = async numTests => {
  let rows = 0
  let res = []
  await delay(3000)
  for (let i = 0; i < numTests; i++) {
    let runT = await addUser(i)
    res.push(runT)
    // await delay(3000)
    // rows += runT
  }
  console.info('Waiting for tests to finish...')
  console.info('Done running tests one decrypt', res)
  console.info('Waiting for server memory stats')
  console.info('Done. Quiting')
  process.exit(-1)
}

let numTests = process.argv[2]
console.info('arrgs', process.argv, numTests)
run(numTests)
