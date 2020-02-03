// eslint-disable-next-line camelcase
const path = require('path')
const svgToPng = require('svg-to-png')
const fs = require('fs-extra')
const pathToAndroidAssetsAnimation = 'android/app/src/main/assets/animations'
const pathToIOSAssetsAnimation = 'ios/assets/animations'
const pathToAssetsAnimations = 'public/animations'
const mainPath = __dirname
const dirs = source =>
  fs
    .readdirSync(source, {
      withFileTypes: true,
    })
    .reduce((a, c) => {
      c.isDirectory() && a.push(c.name)
      return a
    }, [])
// eslint-disable-next-line no-unused-vars
const files = source =>
  fs.readdirSync(source).reduce((a, c) => {
    a.push(c)
    return a
  }, [])
const init = async () => {
  try {

    const animationForConvert = await dirs(path.join(mainPath, pathToAssetsAnimations))
    if (animationForConvert && animationForConvert.length > 0) {
      for (const animationName of animationForConvert) {
        console.log('animation:',animationName)
        const pathToSvgAnimationFile = path.join(mainPath, pathToAssetsAnimations, animationName)
        const newPathToAndroidAnimation = path.join(mainPath, pathToAndroidAssetsAnimation, animationName)
        // eslint-disable-next-line no-await-in-loop
        if (await fs.pathExists(newPathToAndroidAnimation)) {
          // eslint-disable-next-line no-await-in-loop
          await fs.remove(newPathToAndroidAnimation)
        }
        const newPathToIOSAnimation = path.join(mainPath, pathToIOSAssetsAnimation, animationName)
        // eslint-disable-next-line no-await-in-loop
        if (await fs.pathExists(newPathToIOSAnimation)) {
          // eslint-disable-next-line no-await-in-loop
          await fs.remove(newPathToIOSAnimation)
        }
        // eslint-disable-next-line no-await-in-loop
        const animationFiles = (await files(`${pathToAssetsAnimations}/${animationName}`))
        if (animationFiles.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          await svgToPng.convert(pathToSvgAnimationFile, newPathToAndroidAnimation)
          // eslint-disable-next-line no-await-in-loop
          await fs.copySync(newPathToAndroidAnimation, newPathToIOSAnimation)
          // eslint-disable-next-line no-await-in-loop
          await renameFileForIOS(animationName, newPathToIOSAnimation)
        }
      }
    }

  } catch (e) {
    console.log(e)
  }
}
// eslint-disable-next-line require-await
const renameFileForIOS = async (animationName, pathToFiles) => {
  const animationFiles = await files(pathToFiles)
  if (animationFiles) {
    for (const oldName of animationFiles) {
      const newName = oldName.replace('img', animationName)
      // eslint-disable-next-line no-await-in-loop
      await fs.rename(`${pathToFiles}/${oldName}`, `${pathToFiles}/${newName}`)
    }
  }
}
init()
