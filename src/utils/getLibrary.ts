import { Web3Provider } from '@ethersproject/providers'

export default function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider, 'any')

    delete (provider as any).__proto__.request
    // eslint-disable-next-line no-prototype-builtins
    library.provider.hasOwnProperty('request') && delete library.provider.request

    library.pollingInterval = 15000
    return library
}
