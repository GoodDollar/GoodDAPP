const ENS_NAME_REGEX = /^(([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+)eth(\/.*)?$/

export function parseENSAddress(ensAddress: string): { ensName: string; ensPath: string | undefined } | undefined {
    const match = ENS_NAME_REGEX.exec(ensAddress)
    if (!match) return undefined
    return { ensName: `${match[1].toLowerCase()}eth`, ensPath: match[4] }
}
