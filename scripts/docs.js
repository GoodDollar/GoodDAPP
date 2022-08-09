'use strict'
const fs = require('fs')
const { exec } = require('child_process')

const DELETE_EMPTY_DOCS = true
const BASE_DOCS_FOLDER = 'docs/jsdocs/gooddapp'
const BASE_SRC_URL = 'https://github.com/GoodDollar/GoodDAPP'
const excludedFolders = ['__tests__', '__util__']

/**
 * camelCaseToDash('userId') => "user-id"
 * camelCaseToDash('waitAMoment') => "wait-a-moment"
 * camelCaseToDash('TurboPascal') => "turbo-pascal"
 */
function camelCaseToDash(str) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
}

const whenEmptyFileString = new Promise((resolve, reject) => {
  exec(`documentation build ./fakepath -f md --shallow`, (error, stdout, stderr) => {
    if (error) {
      reject(error)
    }
    if (stdout) {
      resolve(stdout)
    }
  })
})

const isValidFile = async filePath => {
  try {
    const emptyDoc = await whenEmptyFileString
    const data = fs.readFileSync(filePath)
    const docString = data.toString()

    return Promise.resolve(docString != emptyDoc)
  } catch (e) {
    return Promise.resolve(false)
  }
}

/**
 * Removes all empty docs and returns a list with actual documentation
 * @param {[string]} docs
 */
async function filterEmptyDocs(docs) {
  const emptyDoc = await whenEmptyFileString
  return docs.filter(doc => {
    if (!doc.mdFile) {
      console.log('no mdFile', doc)
      return false
    }
    const data = fs.readFileSync(doc.mdFile)
    const docString = data.toString()

    return docString !== emptyDoc
  })
}

function promiseFromChildProcess(child) {
  return new Promise(function(resolve, reject) {
    child.addListener('error', e => {
      console.log('Error generating docs:', e)
      reject(e)
    })
    child.addListener('exit', e => {
      if (e !== 0) {
        console.log('Failed process exec:', e)
        reject(e)
      }
      resolve(e)
    })
  })
}

function execPromise(toExec) {
  return promiseFromChildProcess(exec(toExec)).catch(e => console.log('Failed exec', toExec))
}

async function doGenerateToc(docs, { baseFolder, relativeToToc, level }) {
  relativeToToc = relativeToToc || ''
  let outputString = ''
  const currentLevel = level || 0
  if (!docs || docs.length <= 0) return outputString
  const padding = ' '.repeat(currentLevel * 3)
  const results = await Promise.all(
    await docs.map(async doc => {
      let addedOutput = ''

      if (doc.mdFile) {
        const path = doc.mdFile.replace(baseFolder, relativeToToc)
        console.log('TOC path:', { md: doc.mdFile, path })
        addedOutput += `${padding + padding}-   [${doc.src.replace(baseFolder, relativeToToc)}](/${doc.mdFile})\n`
      }

      if (doc.childrenDocs && doc.childrenDocs.length > 0) {
        if (doc.childrenDocs.filter(child => child.mdFile).length > 0) {
          const path = doc.src.replace(baseFolder, relativeToToc)
          addedOutput += `${padding}-   ${path}\n`
        }
        addedOutput += await doGenerateToc(doc.childrenDocs, { baseFolder, relativeToToc, level: currentLevel + 1 })
      }

      return addedOutput
    })
  )
  return results.join('')
}

async function generateToc(docs) {
  console.log('Generating TOC', docs)
  const baseFolder = BASE_DOCS_FOLDER + '/'
  await execPromise(`mkdir -p ${baseFolder}`)

  const title = '\n### GoodDAPP\n\n'

  const outputString = title + (await doGenerateToc(docs, { baseFolder }))
  fs.writeFileSync(`${baseFolder}/README.md`, outputString)
}

async function insertSourceLink(mdFile, srcFile) {
  const link = BASE_SRC_URL + '/' + srcFile
  // console.log('insert line', { link, mdFile })
  return await execPromise(`echo "## Source\n[${link}](${link})\n" >> ${mdFile}`)
}

async function generateDocs(baseFolder, deep, perFile = true) {
  async function doGenerateDocs(folder, deep) {
    const files = fs.readdirSync(folder)
    const filesToProcess = files.filter(fileName => !excludedFolders.includes(fileName))
    // console.log(folder, filesToProcess)
    if (filesToProcess.length == 0) return []
    const results = await Promise.all(
      filesToProcess.map(async file => {
        const filePath = `${folder}/${file}`
        if (fs.lstatSync(filePath).isDirectory() && perFile) {
          const outputFolder = camelCaseToDash(`${filePath.replace(baseFolder, BASE_DOCS_FOLDER)}/`)
          console.log('creating docs folder:', outputFolder)
          await execPromise(`mkdir -p ${outputFolder}`)
          // adding '*.js' causes documentation to not be generated for sub folders
          const childrenDocs = await doGenerateDocs(filePath, deep - 1)
          const newDoc = { src: filePath, childrenDocs }
          console.log('Generated folder docs:', { childrenDocs })
          return newDoc.childrenDocs.length > 0 ? newDoc : false
        } else if (fs.lstatSync(filePath).isFile() && perFile && filePath.endsWith('.js')) {
          const outputFolder = `${folder.replace(baseFolder, BASE_DOCS_FOLDER)}/`
          const mdFile = camelCaseToDash(`${outputFolder + file.replace('.js', '')}.md`)
          // const mdFile = `${outputFolder + file.replace('.js', '')}.md`
          const toExec = `documentation build ${filePath} -f md -o ${mdFile} --shallow`
          console.log('Generating docs for:', { filePath, mdFile, toExec })
          await execPromise(toExec)
          const newDoc = { src: folder + '/' + file }
          if (await isValidFile(mdFile)) {
            newDoc.mdFile = mdFile
            await insertSourceLink(mdFile, filePath)
          }

          return newDoc.mdFile ? newDoc : false
        }
        // //generate recursively for all subfolders when reaching last level
        // else if (fs.lstatSync(filePath).isDirectory() && deep == 0) {
        //   const outputFolder = `${folder.replace(baseFolder, BASE_DOCS_FOLDER)}/`
        //   await execPromise(`mkdir -p ${outputFolder}`)

        //   const mdFile = camelCaseToDash(`${outputFolder + file}.md`)
        //   const toExec = `documentation build ${filePath} -f md -o ${mdFile} --shallow`
        //   return execPromise(toExec).then(r => ({ mdFile, folder: outputFolder + file }))
        // }
        // //generate docs only for direct source files for non last level directory
        // else if (fs.lstatSync(filePath).isDirectory()) {
        //   const outputFolder = `${folder.replace(baseFolder, BASE_DOCS_FOLDER)}/`
        //   await execPromise(`mkdir -p ${outputFolder}`)
        //   //adding '*.js' causes documentation to not be generated for sub folders
        //   const mdFile = camelCaseToDash(`${outputFolder + file}.md`)
        //   const toExec = `documentation build ${filePath}/*.js -f md -o ${mdFile} --shallow`
        //   const childrenDocs = await doGenerateDocs(filePath, deep - 1).then(filterEmptyDocs)
        //   await execPromise(toExec)

        //   const newDoc = { folder: outputFolder + file, childrenDocs }
        //   if (await isValidFile(mdFile)) {
        //     newDoc.mdFile = mdFile
        //   }

        //   return newDoc.mdFile || newDoc.childrenDocs.length > 0 ? newDoc : false
        // }
        return Promise.resolve(false)
      })
    )
    return results.filter(_ => _)
  }

  console.log('Generating docs...')

  await execPromise('rm -rf docs/*')
  const childrenDocs = await doGenerateDocs(baseFolder, deep)
  // currently let gitbook handle TOC
  // generateToc(childrenDocs)

  if (DELETE_EMPTY_DOCS) {
    console.log('Deleting empty docs...')
    await execPromise("find ./docs -name '*.md'  -size 118c -delete")
    await execPromise('find ./docs -type d -empty -delete')
  }
  console.log('done!')
}

generateDocs('src', 5)
