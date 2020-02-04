// eslint-disable-next-line camelcase
const path = require('path')
const util = require("util")
const fs = require("pn/fs") // https://www.npmjs.com/package/pn
const fsNode = require("fs-extra") // https://www.npmjs.com/package/pn
const xml = require("node-xml-lite")
const svg2png = require("svg2png")
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

const getAndroidPath = (animationName) => path.join(mainPath, pathToAndroidAssetsAnimation, animationName)
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
const copyToIOSAndRename = async (animationName) => {
  const newPathToAndroidAnimation = getAndroidPath(animationName)
  const newPathToIOSAnimation = getIOSPath(animationName)
  await createPath(newPathToIOSAnimation)
  const animationFiles = await files(newPathToAndroidAnimation)
  if (animationFiles) {
    for (const oldName of animationFiles) {
      const newName = oldName.replace('img', animationName)
      await fs.copyFile(path.join(newPathToAndroidAnimation, oldName), path.join(newPathToIOSAnimation, newName))
    }
  }
}
const renderPrettyDate = (uglyDate) => {
  return uglyDate.toISOString()
}
const parseDimension = (dimensionValue, dimensionName, directoryName, imageName) => {
  const dimensionAsString = dimensionValue

  if (!dimensionAsString.endsWith("px")) {
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
const convertSingleSVG2PNGWithAmplification = (svgData, directoryFrom, directoryTo, imageName, amplification) => {
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
    const pngFileName = path.resolve(directoryTo, imageName + amplificationString + '.png')

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
  const newPathToAndroidAnimation = getAndroidPath(animationName)
  await createPath(newPathToAndroidAnimation)
  convertSingleSVG2PNGWithAmplification(svgData, svgPath, newPathToAndroidAnimation, imageName, amplification)
  await copyToIOSAndRename(animationName)
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
