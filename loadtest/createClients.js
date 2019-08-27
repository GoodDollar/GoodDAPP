//@flow
import bip39 from 'bip39-light'
import faker from 'faker'
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
class TestClient {
  constructor(id: string) {
    this.id = id
  }

  init = async () => {
    const gun = global.Gun({
      file: './loadtest/loadtest' + Math.random() + '.json',
      localStorage: false,
      peers: [`${Config.gunPublicUrl}`],
      multicast: false,
      axe: true,
    })
    let mnemonic = bip39.generateMnemonic()
    this.wallet = new GoodWallet({ mnemonic })
    await this.wallet.ready
    await API.ready
    this.storage = new UserStorage(this.wallet, gun)
    let login = new GoodWalletLogin(this.wallet, this.storage)
    await Timeout(10000)
    console.log('Waiting for client sotrage', this.id, this.storage.ready)
    await this.storage.ready
    console.log('CLIENT STORAGE READY')
    this.creds = await login.auth()

    // console.info({ creds })
    this.randomName = faker.name.findName() // Rowan Nikolaus
    this.randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
    this.randomCard = faker.phone.phoneNumber('+972507######')
  }

  saveProfile = () => {
    return this.storage.setProfile({
      fullName: this.randomName,
      email: this.randomEmail,
      mobile: this.randomCard,
      walletAddress: this.wallet.account,
    })
  }

  adduser = () => {
    return Promise.race([
      Timeout(20000).then(x => {
        throw new Error('adduser timeout')
      }),
      API.addUser({
        fullName: this.randomName,
        email: this.randomEmail,
        mobile: this.randomCard,
        walletAddress: this.wallet.account,
      }),
    ])
  }
}

const createClients = async (count: number) => {
  console.log(Config)
  let clients = []
  for (let i = 0; i < count; i++) {
    clients.push(new TestClient(i.toString()))
  }

  let promises = []
  for (let i = 0; i < clients.length; i++) {
    let client = clients[i]
    promises.push(client.init())
    await Timeout(500)
  }
  return Promise.all(promises).then(_ => clients)
}
export { TestClient, createClients, Timeout }
