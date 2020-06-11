import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

// utils
import GoodWallet from '../../../lib/wallet/GoodWallet'
import config from '../../../config/config'
import { getWebRouterComponentWithMocks } from './__util__'

describe('ReceiveToAddress', () => {
  const ExportWalletData = getWebRouterComponentWithMocks('../ExportWalletData')
  let rememberPrivateKey, rememberRPC

  beforeAll(async () => {
    await GoodWallet.ready

    rememberPrivateKey = GoodWallet.wallet.eth.accounts.wallet[0].privateKey
    rememberRPC = config.ethereum[GoodWallet.networkId].httpWeb3provider

    GoodWallet.wallet.eth.accounts.wallet[0].privateKey = '0x00'
    config.ethereum[GoodWallet.networkId].httpWeb3provider = 'http://test.domain.com'
  })

  afterAll(() => {
    GoodWallet.wallet.eth.accounts.wallet[0].privateKey = rememberPrivateKey
    config.ethereum[GoodWallet.networkId].httpWeb3provider = rememberRPC
  })

  it('renders without errors', () => {
    const tree = renderer.create(<ExportWalletData />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ExportWalletData />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
