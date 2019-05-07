'use strict';
const fs = require('fs');
const { exec } = require('child_process');

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

//"docs": "documentation build src -f md -o docs/code.md --shallow"

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

async function generateDocs(baseFolder, deep){

    async function doGenerateDocs(folder, deep) {
        const files = fs.readdirSync(folder);
        const filesToProcess = files.filter(fileName => !excludedFolders.includes(fileName))
        const results = await Promise.all(filesToProcess.map(async file => {
            const filePath = `${folder}/${file}`;
            if(fs.lstatSync(filePath).isDirectory() && deep>0) {
                const outputFolder = `${folder.replace(baseFolder,'docs')}/`
                await execPromise(`mkdir -p ${outputFolder}`)

                const toExec = `documentation build ${filePath} -f md -o ${outputFolder+file}.md --shallow`
                await doGenerateDocs(filePath, deep-1)
                return execPromise(toExec)
            }

            return Promise.resolve(false)
        }))
    }

    await execPromise('rm -rf docs/*')
    doGenerateDocs(baseFolder, deep)
}

generateDocs('src',2)
