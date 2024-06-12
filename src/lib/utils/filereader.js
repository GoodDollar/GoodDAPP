// @flow

const readFile = (file, format: 'text' | 'dataurl', encoding = 'UTF-8') =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)

    switch (format) {
      case 'text':
        reader.readAsText(file, encoding)
        break
      case 'dataurl':
        reader.readAsDataURL(file)
        break
      default:
        throw new Error('Invalid format specified')
    }
  })

export const readAsDataURL = file => readFile(file, 'dataurl')

export const readAsText = (file, encoding = 'UTF-8') => readFile(file, 'text', encoding)
