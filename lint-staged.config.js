const { ESLint } = require('eslint')
const { writeFile } = require('fs')
const { promisify } = require('util')

const eslint = new ESLint()
const writeFileAsync = promisify(writeFile)
const tsConfigPath = './tsconfig.lint-staged.json'

const tsConfig = (files) => `
{
  "extends": "./tsconfig.json",
  "include": [
    "./src/**/*.d.ts",
    "./types",
    ${files.join(',\n')}
  ],
  "compilerOptions": {
    "noEmit": true
  }
}    
`

module.exports = {
  '**/*.{js,jsx,ts,tsx}': async (files) => {
    const ignored = await Promise.all(files.map(async (file) => eslint.isPathIgnored(file)))
    const filtered = files.filter((_, index) => !ignored[index]).map((path) => `"${path}"`)
    
    await writeFileAsync(tsConfigPath, tsConfig(filtered))
    return [`eslint --no-ignore --max-warnings=0 ${filtered.join(' ')} --fix`, `tsc --p ${tsConfigPath}`]
  },
}
