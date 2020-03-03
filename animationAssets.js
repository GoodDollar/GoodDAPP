// eslint-disable-next-line camelcase
const path = require('path')
const util = require("util")
const fs = require("pn/fs") // https://www.npmjs.com/package/pn
const fsNode = require("fs-extra") // https://www.npmjs.com/package/pn
const xml = require("node-xml-lite")
const svg2png = require("svg2png")
const pathToAndroidRes = 'android/app/src/main/res'
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

const getAndroidResPath = (drawable) => path.join(mainPath, pathToAndroidRes, drawable)
const getAndroidAssetsPath = () => path.join(mainPath, pathToAndroidAssetsAnimation)
const getIOSPath = (animationName) => path.join(mainPath, pathToIOSAssetsAnimation, animationName)
const getSVGPath = (animationName) => path.join(mainPath, pathToAssetsAnimations, animationName)
// const cleanAndroidDir = async (animationName) => {
//   const newPathToAndroidAnimation = getAndroidPath(animationName)
//   if (await fs.pathExists(newPathToAndroidAnimation)) {
//     // eslint-disable-next-line no-await-in-loop
//     await fs.remove(newPathToAndroidAnimation)
//   }
// }
// const cleanIOSDir = async (animationName) => {
//   const newPathToIOSAnimation = getIOSPath(animationName)
//   // eslint-disable-next-line no-await-in-loop
//   if (await fs.pathExists(newPathToIOSAnimation)) {
//     // eslint-disable-next-line no-await-in-loop
//     await fs.remove(newPathToIOSAnimation)
//   }
// }
const createPath = async (somePath) => {
  await fsNode.mkdirsSync(somePath)
}
// const renameIOS = async (animationName, image, amplification) => {
//   const oldName = `${image}${amplification>1?`@${amplification}x`:''}.png`
//   const iosPAth = getIOSPath(animationName)
//   const newName = oldName.replace('img', animationName)
//   await fs.rename(path.join(iosPAth, oldName), path.join(iosPAth, newName))
// }

const mapping = {
  1: ['drawable-mdpi', 'drawable-ldpi'],
  2: ['drawable-hdpi'],
  3: ['drawable-xhdpi'],
}

const copyAndroidFile = async (animationName, image, amplification) => {

  const imageName = `${image.replace('img', animationName)}${amplification > 1 ? `@${amplification}x` : ''}.png`
  const newName = `${image.replace('img', animationName)}.png`.toLowerCase()
  const newPathToIOSAnimation = getIOSPath(animationName)
  for (const folder of mapping[amplification]) {
    const newPath = getAndroidResPath(folder)
    await createPath(newPath)
    console.log(path.join(newPathToIOSAnimation, imageName), '=>', path.join(newPath, newName))
    await fs.copyFileSync(path.join(newPathToIOSAnimation, imageName), path.join(newPath, newName))
    if (amplification === 3) {
      const newPath = getAndroidAssetsPath()
      await createPath(newPath)
      await fs.copyFileSync(path.join(newPathToIOSAnimation, imageName), path.join(newPath, newName))
    }
  }
}

const renderPrettyDate = (uglyDate) => {
  return uglyDate.toISOString()
}
const parseDimension = (dimensionValue, dimensionName, directoryName, imageName) => {
  const dimensionAsString = dimensionValue
  if (!(dimensionAsString && dimensionAsString.endsWith("px"))) {
    throw new Error(dimensionName + " must end with px, but it rather is: " + dimensionAsString)
  }

  const dimensionAsInt = parseInt(dimensionAsString)

  if (Number.isNaN(dimensionAsInt)) {
    throw new Error(dimensionName + " must be integer, but it rather is: " + dimensionAsString)
  }

  return dimensionAsInt
}
const getLastModifiedDateTimeForFile = (fileName) => {
  const stats = fs.statSync(fileName)
  return new Date(util.inspect(stats.mtime))
}
const convertSingleSVG2PNGWithAmplification = (
  animationName, svgData, directoryFrom, directoryTo, imageName, amplification) => {
  try {

    if (!(svgData.buffer)) {
      // Determine the SVG file name
      const svgFileName = path.resolve(directoryFrom, imageName + '.svg')

      // Read file
      const svgBuffer = fs.readFileSync(svgFileName)

      // Read as XML and get width and height
      const svgXml = xml.parseBuffer(svgBuffer)
      const width = parseDimension(svgXml.attrib.width, "Width", directoryFrom, imageName)
      const height = parseDimension(svgXml.attrib.height, "Height", directoryFrom, imageName)

      // Get last modified date/time
      const lastModified = getLastModifiedDateTimeForFile(svgFileName)

      Object.assign(svgData, {
        buffer: svgBuffer,
        width,
        height,
        lastModified,
      })

      console.log("-- Processing SVG: " + svgFileName + ", last modified: " + renderPrettyDate(lastModified))
    }

    // Determine PNG file name
    const amplificationString = amplification > 1 ? '@' + amplification + 'x' : ''
    const pngFileName = path.resolve(directoryTo,
      imageName.replace('img', animationName) + amplificationString + '.png')

    // Determine last modified and compare to SVG. Use 1/1/1970 if not found so that SVG appears older
    let pngLastModified = null

    try {
      pngLastModified = getLastModifiedDateTimeForFile(pngFileName)
    } catch (err) {
      if (err.code === 'ENOENT') {
        pngLastModified = new Date(0)
      } else {
        throw err
      }
    }

    if (pngLastModified <= svgData.lastModified) {
      const width = amplification * svgData.width
      const height = amplification * svgData.height

      console.log("-- Rendering PNG: " + pngFileName + ", width: " + width + ", height: " + height)

      const pngBuffer = svg2png.sync(svgData.buffer, {
        width,
        height,
      })
      fs.writeFileSync(pngFileName, pngBuffer)
    } else {
      console.log("-- Skipping PNG: " + pngFileName + ", last modified: " + renderPrettyDate(pngLastModified))
    }
  } catch (err) {
    throw new Error("-- Could not convert " + directoryFrom + "." + imageName + ".svg because: " + err.message)
  }
}
const convertAndCopyFile = async (svgData, animationName, imageName, amplification) => {
  const svgPath = getSVGPath(animationName)
  const newPathToIOSAnimation = getIOSPath(animationName)
  await createPath(newPathToIOSAnimation)
  convertSingleSVG2PNGWithAmplification(animationName, svgData, svgPath, newPathToIOSAnimation, imageName,
    amplification)
  await copyAndroidFile(animationName, imageName, amplification)
  // await renameIOS(animationName,imageName,amplification)
}
const convertSingleAnimationFile = async (file, animationName) => {
  const imageName = file.substring(0, file.length - 4)
  const svgData = {}
  await convertAndCopyFile(svgData, animationName, imageName, 1)
  await convertAndCopyFile(svgData, animationName, imageName, 2)
  await convertAndCopyFile(svgData, animationName, imageName, 3)
}
const convertAllAnimationFiles = async (animationName) => {
  const animationFiles = await files(getSVGPath(animationName))
  if (animationFiles.length > 0) {
    for (const file of animationFiles) {
      if (file && file.toLowerCase().endsWith('.svg')) {
        console.log('- file:', file)
        await convertSingleAnimationFile(file, animationName)
      } else {
        console.log('- file:', file, 'SKIP')
      }
    }
  }
}
const convertSingleAnimation = async (animationName) => {
  console.log('animation:', animationName)
  // await cleanAndroidDir(animationName)
  // await cleanIOSDir(animationName)
  await convertAllAnimationFiles(animationName)
}

const convertAllAnimations = async () => {
  const animationForConvert = await dirs(path.join(mainPath, pathToAssetsAnimations))
  if (animationForConvert && animationForConvert.length > 0) {
    for (const animationName of animationForConvert) {
      await convertSingleAnimation(animationName)
    }
  }
}

const init = async () => {
  try {
    await convertAllAnimations()
  } catch (e) {
    console.log(e)
  }
}
// eslint-disable-next-line require-await

init()
