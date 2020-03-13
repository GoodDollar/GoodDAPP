import _get from 'lodash/get'
import jpeg from 'jpeg-js'
import ImageEditor from 'image-js/dist/image'

//{"bounds": {"origin": {"x": 23.156605113636374, "y": 200.6962890625}, "size": {"height": 433.533203125, "width": 300.4031723484848}}, "faceID": 3, "rollAngle": -10.545342445373535, "yawAngle": 8.326322555541992}
const isValidFace = (viewport, face) => {
  console.log('AAAAAA', { viewport, face })
  if (!face) {
    return
  }
  const facesize = face.bounds
  const requiredWidth = viewport.width * 0.6
  const requiredHeight = viewport.height * 0.6
  const eyesDistance = _get(face, 'leftEyePosition', 0) - _get(face, 'rightEyePosition', 0)

  if (eyesDistance > 0) {
    return { ok: false, error: 'Eyes distance ' + eyesDistance }
  }
  if (facesize.size.width < requiredWidth * 0.7 || facesize.size.height < requiredHeight * 0.7) {
    return { ok: false, error: 'Move Closer' }
  }
  if (facesize.size.width > requiredWidth * 1.3 || facesize.size.height > requiredHeight * 1.3) {
    return { ok: false, error: 'Move Away' }
  }
  if (
    facesize.origin.x > viewport.width * 0.3 ||
    facesize.origin.y > viewport.height * 0.3 ||
    facesize.origin.x < viewport.width * 0.15 ||
    facesize.origin.y < viewport.height * 0.15
  ) {
    return { ok: false, error: 'Frame Your Face' }
  }
  if (Math.abs(face.yawAngle) > 5 || Math.abs(face.rollAngle) > 5) {
    return { ok: false, error: 'Look Straight' }
  }
  if (
    _get(face, 'smilingProbability', 0) > 0.15 ||
    _get(face, 'leftEyeOpenProbability', 1) < 0.93 ||
    _get(face, 'rightEyeOpenProbability', 1) < 0.93
  ) {
    return { ok: false, error: 'Kepp Natural Expression' }
  }
  return { ok: true }
}
const isQualityImage = base64 => {
  const start = Date.now()
  const imgBuffer = Buffer.from(base64, 'base64')
  const rawImageData = jpeg.decode(imgBuffer)
  const { height, width, data } = rawImageData
  const area = height * width
  const calcAvgColor = () => {
    let colorSum = 0
    for (let r, g, b, a, avg, x = 0, len = data.length; x < len; x += 4) {
      r = data[x]
      g = data[x + 1]
      b = data[x + 2]
      a = data[x + 3]

      avg = Math.floor((r + g + b) / 3)
      colorSum += avg
    }
    return Math.floor(colorSum / area)
  }

  const brightness = calcAvgColor()
  return { ok: brightness > 80, brightness }
}

const cropToFace = async (img, face, viewport) => {
  const edit = await ImageEditor.load(Buffer.from(img.base64, 'base64'))
  const viewW = viewport.width
  const viewH = viewport.height

  //expand the facebox and get relative img coordinates of face
  const imgX = Math.floor((face.bounds.origin.x / viewW) * img.width * 0.8)
  const imgY = Math.floor((face.bounds.origin.y / viewH) * img.height * 0.8)
  let imgW = Math.floor((face.bounds.size.width / viewW) * img.width)
  imgW = imgW + imgX > img.width ? img.width - imgX : imgW
  let imgH = Math.floor((face.bounds.size.height / viewH) * img.height * 1.2)
  imgH = imgH + imgY > img.height ? img.height - imgY : imgH

  return edit
    .crop({
      x: imgX,
      y: imgY,
      width: imgW,
      height: imgH,
    })
    .toBase64('image/jpeg')
}
export { isValidFace, isQualityImage, cropToFace }
