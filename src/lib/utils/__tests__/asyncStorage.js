import AsyncStorage from '../asyncStorage'

jest.mock('../asyncStorage', () => {
  const items = {}

  return {
    setItem: jest.fn((key, value) => {
      return new Promise(resolve => {
        items[key] = value
        resolve(value)
      })
    }),
    getItem: jest.fn(key => {
      return new Promise(resolve => {
        const element = items[key]
        if (element) {
          resolve(items[key])
        } else {
          resolve(null)
        }
      })
    }),
    removeItem: jest.fn(key => {
      return new Promise(resolve => {
        const element = items[key]
        if (element) {
          resolve(delete items[key])
        } else {
          resolve(null)
        }
      })
    }),
  }
})

describe('AsyncStorage', () => {
  // setters
  it('should set item: <string>', () => {
    return AsyncStorage.setItem('GD_name', 'GoodDollar Admin').then(res => {
      expect(res).toBe('GoodDollar Admin')
    })
  })

  it('should set item: <bool>', () => {
    return AsyncStorage.setItem('GD_enabled', false).then(res => {
      expect(res).toBeFalsy()
    })
  })

  it('should set item: <object>', () => {
    const mockedUser = { name: 'GoodDollar Admin', email: 'goodadmin@gooddollar.org' }
    return AsyncStorage.setItem('GD_user', mockedUser).then(res => {
      expect(res).toEqual({ ...mockedUser })
    })
  })

  it('should set item: <array>', () => {
    const mockedFeed = []
    return AsyncStorage.setItem('GD_feed', mockedFeed).then(res => {
      expect(res).toEqual([...mockedFeed])
    })
  })

  // getters
  it('should read item: <string>', () => {
    return AsyncStorage.getItem('GD_name').then(res => {
      expect(res).toBe('GoodDollar Admin')
    })
  })

  it('should read item: <bool>', () => {
    return AsyncStorage.getItem('GD_enabled').then(res => {
      expect(res).not.toBe(true)
    })
  })

  it('should read item: <object>', () => {
    const mockedUser = { name: 'GoodDollar Admin', email: 'goodadmin@gooddollar.org' }
    return AsyncStorage.getItem('GD_user').then(res => {
      expect(res).toEqual({ ...mockedUser })
    })
  })

  // removers
  it('should remove item: <array>', () => {
    return AsyncStorage.removeItem('GD_feed').then(res => {
      expect(res).toBeTruthy()
    })
  })

  it('should remove item: <string>', () => {
    return AsyncStorage.removeItem('GD_surname').then(res => {
      expect(res).not.toBeTruthy()
    })
  })
})
