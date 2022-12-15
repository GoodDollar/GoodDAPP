declare module '@gooddollar/goodprotocol/releases/deployment.json' {
    export type ObjectLike = { [key: string]: string | ObjectLike | Array<string[]> | string[] }
    type JSON = {
        olddao: ObjectLike
        develop: ObjectLike
        'develop-mainnet': ObjectLike
        'kovan-mainnet': ObjectLike
        fuse: ObjectLike
        'fuse-mainnet': ObjectLike
        dapptest: ObjectLike
        'dapptest-mainnet': ObjectLike
        'staging-mainnet': ObjectLike
        staging: ObjectLike
        test: ObjectLike
        'test-mainnet': ObjectLike
        production: ObjectLike
        [key: string]: ObjectLike
    }

    const value: JSON
    export default value
}
declare module '@gooddollar/goodprotocol/releases/deploy-settings.json' {
    export type ObjectLike = { [key: string]: string | ObjectLike<ObjectLike> | Array<string[]> | string[] }
    type JSON = {
        default: ObjectLike
        develop: ObjectLike
        'develop-mainnet': ObjectLike
        dapptest: ObjectLike
        'dapptest-mainnet': ObjectLike
        test: ObjectLike
        'test-mainnet': ObjectLike
        fuse: ObjectLike
        'fuse-mainnet': ObjectLike
        staging: ObjectLike
        'staging-mainnet': ObjectLike
        'kovan-mainnet': ObjectLike
        production: ObjectLike
        'production-mainnet': ObjectLike
        [key: string]: ObjectLike
    }
    const value: JSON
    export default value
}
