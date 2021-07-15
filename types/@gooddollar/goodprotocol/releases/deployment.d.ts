declare module "@gooddollar/goodprotocol/releases/deployment.json" {
  export type ObjectLike = { [key: string]: string | ObjectLike | Array<string[]> | string[] }
  type JSON = {
    "olddao": ObjectLike,
    "develop": ObjectLike,
    "develop-mainnet": ObjectLike,
    "kovan-mainnet": ObjectLike,
    [key: string]: ObjectLike
  }

  const value: JSON
  export default value
}