const sizesWithMock = args => {
  const { screenHeight, screenWidth, isPortrait } = args || {}
  jest.doMock('../Orientation', () => {
    return {
      getScreenHeight: () => screenHeight || 616,
      getScreenWidth: () => screenWidth || 360,
      isPortrait: () => (isPortrait === undefined ? true : isPortrait),
    }
  })

  return require('../sizes')
}

describe('sizes', () => {
  describe('getDesignRelativeWidth', () => {
    beforeEach(() => jest.resetModules())

    it(`With 360 width screen 360 should return 360`, () => {
      const { getDesignRelativeWidth } = sizesWithMock()
      const size = getDesignRelativeWidth(360)

      expect(size).toEqual(360)
    })

    it(`With 360 width screen 100 should return 100`, () => {
      const { getDesignRelativeWidth } = sizesWithMock()
      const size = getDesignRelativeWidth(100)

      expect(size).toEqual(100)
    })

    it(`With 180 width screen 100 should return 50`, async () => {
      const { getDesignRelativeWidth } = await sizesWithMock({ screenWidth: 180, isPortrait: true })
      const size = getDesignRelativeWidth(100)

      expect(size).toEqual(50)
    })

    it(`With 360 height screen and portrait  100 should return 100`, async () => {
      const { getDesignRelativeWidth } = await sizesWithMock({ screenHeight: 360, isPortrait: false })
      const size = getDesignRelativeWidth(100)

      expect(size).toEqual(100)
    })

    it(`With 720 width screen with 100 width should return 100`, async () => {
      const { getDesignRelativeWidth } = await sizesWithMock({ screenWidth: 720 })
      const size = getDesignRelativeWidth(100)

      expect(size).toEqual(100)
    })

    it(`With 720 width screen with 100 and isMax=false width should return 200`, async () => {
      const { getDesignRelativeWidth } = await sizesWithMock({ screenWidth: 720 })
      const size = getDesignRelativeWidth(100, false)

      expect(size).toEqual(200)
    })
  })

  describe('getDesignRelativeHeight', () => {
    beforeEach(() => jest.resetModules())

    it(`With 616 height screen 100 should return 100`, () => {
      const { getDesignRelativeHeight } = sizesWithMock()
      const size = getDesignRelativeHeight(100)

      expect(size).toEqual(100)
    })

    it(`With 308 height screen 100 should return 50`, async () => {
      const { getDesignRelativeHeight } = await sizesWithMock({ screenHeight: 308, isPortrait: true })
      const size = getDesignRelativeHeight(100)

      expect(size).toEqual(50)
    })

    it(`With 616 width screen and portrait false  100 should return 100`, async () => {
      const { getDesignRelativeHeight } = await sizesWithMock({ screenWidth: 616, screenHeight: 1, isPortrait: false })
      const size = getDesignRelativeHeight(100)

      expect(size).toEqual(100)
    })

    it(`With 1232 height screen with 100 width should return 100`, async () => {
      const { getDesignRelativeHeight } = await sizesWithMock({ screenHeight: 1232 })
      const size = getDesignRelativeHeight(100)

      expect(size).toEqual(100)
    })

    it(`With 1232 width screen with 100 and isMax=false width should return 200`, async () => {
      const { getDesignRelativeHeight } = await sizesWithMock({ screenHeight: 1232 })
      const size = getDesignRelativeHeight(100, false)

      expect(size).toEqual(200)
    })
  })
})
