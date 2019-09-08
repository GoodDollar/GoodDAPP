import { hideDialog, showDialogForError, showDialogWithData } from '../dialog'

// Creating a undux mock store. It behaves as a basic undux store
const createStore = (intialValues = {}) => {
  return {
    values: intialValues,
    get: function(key) {
      return this.values[key]
    },
    set: function(key) {
      return value => {
        this.values[key] = value
      }
    },
  }
}

describe('Dialog', () => {
  it('show dialog with data', () => {
    const store = createStore()
    const data = {
      title: 'Title',
    }
    showDialogWithData(store, data)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        ...data,
        visible: true,
      },
    })
  })

  it('hide dialog', () => {
    const store = createStore()
    hideDialog(store)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        visible: false,
      },
    })
  })

  it('show dialog with data and then hide it', () => {
    const store = createStore()
    const data = {
      title: 'Title',
    }
    showDialogWithData(store, data)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        ...data,
        visible: true,
      },
    })

    hideDialog(store)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        visible: false,
      },
    })
  })

  it('show dialog for error in message', () => {
    const store = createStore()
    const message = 'Error message'
    const error = {
      message,
    }
    showDialogForError(store, 'human readable', error)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        visible: true,
        title: 'Ooops...',
        message: `human readable\n${message}`,
        type: 'error',
      },
    })
  })

  it('show dialog for error in err', () => {
    const store = createStore()
    const err = 'Error message'
    const error = {
      err,
    }
    showDialogForError(store, 'human readable', error)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        visible: true,
        title: 'Ooops...',
        message: `human readable\n${err}`,
        type: 'error',
      },
    })
  })

  it('show dialog for error in response', () => {
    const store = createStore()
    const message = 'Error message'
    const error = {
      response: {
        data: {
          message,
        },
      },
    }
    showDialogForError(store, 'human readable', error)
    expect(store.get('currentScreen')).toEqual({
      dialogData: {
        visible: true,
        title: 'Ooops...',
        message: `human readable\n${message}`,
        type: 'error',
      },
    })
  })
})
