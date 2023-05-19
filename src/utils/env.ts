import { osName, osVersion as detectedOSVersion } from 'mobile-device-detect'

export interface IOSVersionInfo {
    osName: string
    version: string
    major: number
    minor: number
    patch: number
    build: number
}

export function getNetworkEnv(defaultValue = 'development-celo'): string {
    return process.env.REACT_APP_NETWORK || defaultValue
}

export function getEnv(defaultValue = 'development'): string {
    const network = getNetworkEnv('')

    if (!network) {
        return defaultValue
    }

    if (network === 'fuse') {
        return 'development'
    }

    return network
}

export const osVersionInfo = (() => {
    const version = detectedOSVersion
    const [major, minor = 0, patch = 0, build = 0] = version.split('.').map(Number)

    return { osName, version, major, minor, patch, build }
})()

export const osVersion: string = (() => {
    const { osName, version } = osVersionInfo

    return `${osName} ${version}`
})()
