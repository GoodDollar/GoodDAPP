export const query = `{
  reserveHistories(first: 1 orderBy:block orderDirection:desc where:{ubiMintedFromInterest_gt:0}) {
    blockTimestamp
    openPriceDAI
    interestReceivedDAI
    ubiMintedFromExpansion
  }
}`
