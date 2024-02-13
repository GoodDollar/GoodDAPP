// this is a hack for vite.
const injectScript = src => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.addEventListener('load', resolve)
    script.addEventListener('error', e => reject(e.error))
    document.head.appendChild(script)
  })
}

let injected = false
export const importSDK = async () => {
  if (injected) {
    return
  }
  await injectScript('/facetec/FaceTecSDK.web.js')
  injected = true
}
