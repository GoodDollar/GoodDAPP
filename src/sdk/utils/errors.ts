export class UnsupportedChainId extends Error {
  constructor(chainId: number | string = 'UNKNOWN') {
    super(`Unsupported chain ${ chainId }`);
  }
}

export class InvalidChainId extends Error {
  constructor(expectedChainId: number | string) {
    super(`Invalid chain, expected ${ expectedChainId }`);
  }
}

export class UnsupportedToken extends Error {
  constructor(token: string = 'UNKNOWN') {
    super(`Unsupported token ${ token }`);
  }
}

export class UnexpectedToken extends Error {
  constructor(token: string = 'UNKNOWN') {
    super(`Unexpected token ${ token }`);
  }
}

export class InsufficientLiquidity extends Error {
  constructor() {
    super(`Insufficient liquidity for this trade`);
  }
}
