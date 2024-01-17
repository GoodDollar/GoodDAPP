export const readAsDataURL = (file, encoding) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => resolve(fileReader.result)
    fileReader.onerror = () => reject(fileReader.error)
    fileReader.readAsDataURL(file, encoding)
  })
export const readAsText = (file, encoding) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => resolve(fileReader.result)
    fileReader.onerror = () => reject(fileReader.error)
    fileReader.readAsText(file, encoding)
  })
