export const query = `{
  reserveHistories(first: 1 orderBy:block orderDirection:desc) {
    blockTimestamp
    closePriceDAI
  }
}`
