// eslint-disable-next-line camelcase
const svg_to_png = require('svg-to-png')
const fs = require('fs-extra')

const pathToAdnroidAssetsAnimation = '../android/app/src/main/assets/animations'
const pathToIOSAssetsAnimation = '../ios/assets/animations'
const pathToAssetsAnimations = '../public/animations'
const path = __dirname
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
  const anivationForConvert = await dirs(pathToAssetsAnimations)
  if (anivationForConvert && anivationForConvert.length > 0) {
    for (let index in anivationForConvert) {
      const animationName = anivationForConvert[index]

      const pathToSvgAnimationFile = `${path}/${pathToAssetsAnimations}/${animationName}`

      const newPathToAndroidAnimation = `${path}/${pathToAdnroidAssetsAnimation}/${animationName}`
      // eslint-disable-next-line no-await-in-loop
      if (await fs.pathExists(newPathToAndroidAnimation)) {
        // eslint-disable-next-line no-await-in-loop
        await fs.remove(newPathToAndroidAnimation)
      }

      const newPathToIOSAnimation = `${path}/${pathToIOSAssetsAnimation}/${animationName}`
      // eslint-disable-next-line no-await-in-loop
      if (await fs.pathExists(newPathToIOSAnimation)) {
        // eslint-disable-next-line no-await-in-loop
        await fs.remove(newPathToIOSAnimation)
      }

      // eslint-disable-next-line no-await-in-loop
      const animationfiles = await files(`${pathToAssetsAnimations}/${animationName}`)
      if (animationfiles.length > 0) {
        // eslint-disable-next-line no-await-in-loop
        await svg_to_png.convert(pathToSvgAnimationFile, newPathToAndroidAnimation)
        // eslint-disable-next-line no-await-in-loop
        await fs.copySync(newPathToAndroidAnimation, newPathToIOSAnimation)
        // eslint-disable-next-line no-await-in-loop
        await renamrFileForIOS(animationName, newPathToIOSAnimation)
      }
    }
  }
  console.log(anivationForConvert)
}

// eslint-disable-next-line require-await
const renamrFileForIOS = async (animationName, pathToFiles) => {
  const animationFiles = await files(pathToFiles)
  if (animationFiles) {
    for (let index in animationFiles) {
      const oldName = animationFiles[index]
      const newName = oldName.replace('img', animationName)
      // eslint-disable-next-line no-await-in-loop
      await fs.rename(`${pathToFiles}/${oldName}`, `${pathToFiles}/${newName}`)
    }
  }
}

init()
