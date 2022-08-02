import { createStore } from 'state-pool'

export const cache = createStore({})

const useGlobalCache = key => cache.useState(key)

export default useGlobalCache
