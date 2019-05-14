'use strict';
const fs = require('fs');
const { exec } = require('child_process');
const DELETE_EMPTY_DOCS = false
console.log("Generating docs...")
const excludedFolders = ['__tests__', '__util__']

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

                const toExec = `documentation build ${filePath} -f md -o ${outputFolder+file}.md --shallow`
                return execPromise(toExec).then(r => filePath)
            }
            //generate docs only for direct source files for non last level directory
            else if(fs.lstatSync(filePath).isDirectory())
            {
                const outputFolder = `${folder.replace(baseFolder,'docs')}/`
                await execPromise(`mkdir -p ${outputFolder}`)
                //adding '*.js' causes documentation to not be generated for sub folders
                const toExec = `documentation build ${filePath}/*.js -f md -o ${outputFolder+file}.md --shallow`                
                const childrenDocs = await doGenerateDocs(filePath, deep-1)
                console.log({filePath, childrenDocs})
                await execPromise(toExec)
                //TODO: add children folder docs to TOC
                addTOC(`${outputFolder+file}.md`,childrenDocs)
                return filePath
            }

            return Promise.resolve(false)
        }))
        return results.filter(_ => _)
    }

    await execPromise('rm -rf docs/*')
    await doGenerateDocs(baseFolder, deep)
    if(DELETE_EMPTY_DOCS)
      await execPromise("find ./docs -name '*.md'  -size 118c -delete")
}

generateDocs('src',1)
