const { readdir, readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { bindKey, mapValues } = require('lodash')

const { formatter: createPoFormatter } = require('@lingui/format-po')
const { formatter: createJsonFormatter } = require('@lingui/format-json')

const poFormatter = createPoFormatter()
const jsonFormatter = createJsonFormatter({ style: 'lingui' })

const [readdirAsync, readFileAsync, writeFileAsync] = [readdir, readFile, writeFile].map(promisify)
const [parseJSON, parsePO] = [jsonFormatter, poFormatter].map(formatter => bindKey(formatter, 'parse'))

readdirAsync('src/language/locales')
  .then(async dir => Promise.all(dir.map(async item => {
    const path = `src/language/locales/${item}/`
    const poPath = path + 'catalog.po'    
    
    const catalog = await readFileAsync(path + 'catalog.json.bak', 'utf8').then(parseJSON)
    const poCatalog = await readFileAsync(poPath, 'utf8').then(parsePO)

    const newCatalog = mapValues(poCatalog, item => {
      const { message } = item
      const translation = catalog[message]

      return !translation || translation === message ? item : { ...item, translation }
    })
    
    const output = poFormatter.serialize(newCatalog, {})

    await writeFileAsync(poPath, output)
  })))
  .then(() => console.log('done'))

