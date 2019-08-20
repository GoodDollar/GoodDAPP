const sizesWithMock = args => {
  const { screenHeight, screenWidth, isPortrait } = args || {}
  jest.doMock('../Orientation', () => {
    return {
      getScreenHeight: () => screenHeight || 360,
      getScreenWidth: () => screenWidth || 360,
      isPortrait: () => isPortrait || true,
    }
  })

  return require('../sizes')
}

describe('getDesignRelativeSize', () => {
  beforeEach(() => jest.resetModules())

  it(`With 360 width screen 360 should return 360`, () => {
    const { getDesignRelativeSize } = sizesWithMock()
    const size = getDesignRelativeSize(360)

    expect(size).toEqual(360)
  })

  it(`With 360 width screen 100 should return 100`, () => {
    const { getDesignRelativeSize } = sizesWithMock()
    const size = getDesignRelativeSize(100)

    expect(size).toEqual(100)
  })

  it(`With 180 width screen 100 should return 50`, async () => {
    const { getDesignRelativeSize } = await sizesWithMock({ screenWidth: 180, isPortrait: true })
    const size = getDesignRelativeSize(100)

    expect(size).toEqual(50)
  })

  it(`With 360 height screen and portrait  100 should return 100`, async () => {
    const { getDesignRelativeSize } = await sizesWithMock({ screenHeight: 360, isPortrait: false })
    const size = getDesignRelativeSize(100)

    expect(size).toEqual(100)
  })
})
