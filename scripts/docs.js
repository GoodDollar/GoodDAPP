'use strict';
const fs = require('fs');
const { exec } = require('child_process');
const DELETE_EMPTY_DOCS = true
console.log("Generating docs...")
const excludedFolders = ['__tests__', '__util__']

const getEmptyFileString = (function () {
    let emptyFile
    return async function () {
        return new Promise((resolve, reject) => {
            if(emptyFile) resolve(emptyFile)

            exec(`documentation build ./fakepath -f md --shallow`, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                }
                if(stdout) {
                    resolve(stdout)
                }
            });            
        })
    }
  })();

/**
 * Removes all empty docs and returns a list with actual documentation
 * @param {[string]} docs
 */
async function removeEmptyDocs(docs) {
    const emptyDoc = await getEmptyFileString()
    const actualDocs = docs.filter(docPath => {
        const data = fs.readFileSync(docPath);
        const doc = data.toString()

        return doc != emptyDoc 
    })

    const toRemove = docs.filter(doc => !actualDocs.includes(doc))
    toRemove.forEach(toRemove => fs.unlinkSync(toRemove))
    return actualDocs
}

function promiseFromChildProcess(child) {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
    });
}

function execPromise(toExec) {
    return promiseFromChildProcess(exec(toExec))
}
async function addTOC(doc,children)
{

}
async function generateDocs(baseFolder, deep){

    async function doGenerateDocs(folder, deep) {
        const files = fs.readdirSync(folder);
        const filesToProcess = files.filter(fileName => !excludedFolders.includes(fileName))

        const results = await Promise.all(filesToProcess.map(async file => {
            const filePath = `${folder}/${file}`;
            //generate recursively for all subfolders when reaching last level
            if(fs.lstatSync(filePath).isDirectory() && deep==0) {
                const outputFolder = `${folder.replace(baseFolder,'docs')}/`
                await execPromise(`mkdir -p ${outputFolder}`)

                const mdFile = `${outputFolder+file}.md`
                const toExec = `documentation build ${filePath} -f md -o ${mdFile} --shallow`
                return execPromise(toExec).then(r => mdFile)
            }
            //generate docs only for direct source files for non last level directory
            else if(fs.lstatSync(filePath).isDirectory())
            {
                const outputFolder = `${folder.replace(baseFolder,'docs')}/`
                await execPromise(`mkdir -p ${outputFolder}`)
                //adding '*.js' causes documentation to not be generated for sub folders
                const mdFile = `${outputFolder+file}.md`
                const toExec = `documentation build ${filePath}/*.js -f md -o ${mdFile} --shallow`                
                const childrenDocs = await doGenerateDocs(filePath, deep-1).then(removeEmptyDocs)
                console.log({filePath, mdFile, childrenDocs})
                await execPromise(toExec)
                //TODO: add children folder docs to TOC
                addTOC(`${outputFolder+file}.md`,childrenDocs)
                return { mdFile, childrenDocs }
            }

            return Promise.resolve(false)
        }))
        return results.filter(_ => _)
    }

    await execPromise('rm -rf docs/*')
    const childrenDocs = await doGenerateDocs(baseFolder, deep)
    console.log({childrenDocs})
    if(DELETE_EMPTY_DOCS)
      await execPromise("find ./docs -name '*.md'  -size 118c -delete")
}

generateDocs('src',1)
