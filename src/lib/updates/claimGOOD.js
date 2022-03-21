import API from '../API/api'

const fromDate = new Date('2022/03/19')

const claimGOOD = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const address = goodWallet.account

  try {
    const proof = await API.sharedClient
      .get(`https://airdrop.gooddollar.org/api/repAirdrop/${address}`)
      .catch(e => e.response?.data || { error: e.statusText })

    log.info('claimGOOD proof response:', { address, proof })
    if (proof.error && false === proof.error.includes('does not exists')) {
      throw new Error(proof.error)
    }

    if (proof.hexProof) {
      const hasClaimed =
        (await goodWallet.GOODContract.methods
          .stateHashBalances('0x' + proof.merkleRootHash, proof.addr)
          .call()
          .then(parseInt)) > 0
      if (hasClaimed === false) {
        await goodWallet.sendTransaction(
          goodWallet.GOODContract.methods.proveBalanceOfAtBlockchain(
            'rootState',
            proof.addr,
            proof.reputationInWei,
            proof.hexProof,
            proof.proofIndex,
          ),
        )
      }
      log.info('claimGOOD success', { hasClaimed })
    }
  } catch (e) {
    log.warn('claimGOOD failed:', e, e.message, address) //error is logged by updates
    throw e
  }
}

export default { fromDate, update: claimGOOD, key: 'claimGOOD' }
