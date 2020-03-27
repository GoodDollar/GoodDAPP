const Web3 = require('web3')
const ws = new Web3.providers.WebsocketProvider('ws://localhost:9545/ws')
const w3 = new Web3(ws, null, {
  transactionConfirmationBlocks: 1,
})

let account = w3.eth.accounts.privateKeyToAccount('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d')
w3.eth.accounts.wallet.add(account)
w3.eth.defaultAccount = account.address

const t = async function() {
  console.log('running tx')
  console.log('account balance')
  await w3.eth.getBalance(account.address).then(console.log)
  const p = w3.eth.sendTransaction({
    to: '0xd22B09d3A23172815DD9D637196a9aCf3293298c',
    value: 1,
    from: account.address,
    gas: 100000,
    gasPrice: w3.utils.toWei('1', 'gwei'),
  })
  p.on('receipt', console.log)
  console.log('waiting tx')
  const tx = await p.catch(e => console.log('tx failed', e))
  console.log(tx)
}
t().catch(e => console.log(e))
