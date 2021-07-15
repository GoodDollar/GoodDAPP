
export class UnsupportedChainId extends Error {
  constructor(chainId: number | string) {
    super(`Unsupported chain ${ chainId }`);
  }
}

export class UnsupportedToken extends Error {
  constructor(token: string) {
    super(`Unsupported token ${ token }`);
  }
}
