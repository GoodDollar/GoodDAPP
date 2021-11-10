import AsyncStorage from '../asyncStorage'

describe('AsyncStorage', () => {
  const mockedProps = {
    GD_name: 'GoodDollar Admin',
    GD_enabled: true,
    GD_user: { name: 'GoodDollar Admin', email: 'goodadmin@gooddollar.org' },
    GD_feed: [],
  }

  // setters
  it('should set items: <string>, <bool>, <object>, <array>', async () => {
    await Promise.all(
      Object.keys(mockedProps).map(prop => expect(AsyncStorage.setItem(prop, mockedProps[prop])).resolves),
    )
  })

  // getters
  it('should read items: <string>, <bool>, <object>, <array>', async () => {
    await Promise.all(
      Object.keys(mockedProps).map(prop => expect(AsyncStorage.getItem(prop)).resolves.toEqual(mockedProps[prop])),
    )
  })

  it('should remove items: <string>, <bool>, <object>, <array>', async () => {
    await Promise.all(Object.keys(mockedProps).map(prop => expect(AsyncStorage.removeItem(prop)).resolves))
  })
})
