import './mock-browser'
import bip39 from 'bip39-light'
import faker from 'faker'
import { GoodWallet } from '../src/lib/wallet/GoodWalletClass'
import { GoodWalletLogin } from '../src/lib/login/GoodWalletLogin'
import { UserStorage } from '../src/lib/gundb/UserStorageClass'
import delay from 'delay'
import Config from "../src/config/config"

let failedTests = {}

const addUser = async (i) => {
  let result = 0
  
  try {
    const gun = global.Gun({
      file: './loadtest/' +  new Date().getTime()+'-'+i+'-gun',
      peers: [`${Config.serverUrl}/gun`],
    })
    let mnemonic = bip39.generateMnemonic()
    let wallet = new GoodWallet({ mnemonic })
    await wallet.ready
    const storage = new UserStorage(wallet, gun)
    await storage.ready
    const randomName = faker.name.findName() // Rowan Nikolaus
    const randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
    const randomCard = faker.phone.phoneNumber('+97250#######')
    // let login = new GoodWalletLogin(wallet, storage)
    // let creds = await login.auth()
    let userData = {
      fullName: randomName,
      email: randomEmail,
      mobile: randomCard,
      walletAddress: wallet.account,
    }
    await storage.setProfile(userData)
  
    const start = new Date().getTime()
    const mm = await storage.getProfileFieldValue('email')
    
    const end = new Date().getTime()
    console.log('#############################################')
    console.log(mm);
    console.log('#############################################')
    result = end - start
    
  } catch (error) {
    console.info(`Test failed`, error)
    failedTests[error.message] === undefined ? (failedTests[error.message] = 1) : (failedTests[error.message] += 1)
  } finally {
    // fs.unlinkSync('./loadtest/loadtest' + i + '.json')
  }
  
  return result
}

const run = async numTests => {
  let rows = 0
  await delay(5000)
  for (let i = 0; i < numTests; i++) {
    let runT = await addUser(i)
    await delay(3000)
    rows += runT
  }
  console.info('Waiting for tests to finish...')
  console.info('Done running tests one decrypt', rows / numTests)
  console.info('Waiting for server memory stats')
  console.info('Done. Quiting')
  process.exit(-1)
}

let numTests = process.argv[2]
console.info('arrgs', process.argv, numTests)
run(numTests)
