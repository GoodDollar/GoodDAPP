import { once } from 'lodash'

// this is a hack for vite. facetec sdk doesnt seem to work if not injectd via script tag but imported.
const injectScript = src => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.addEventListener('load', resolve)
    script.addEventListener('error', e => reject(e.error))
    document.head.appendChild(script)
  })
}

export const importSDK = once(async () => {
  await injectScript('/facetec/FaceTecSDK.web.js')
})
