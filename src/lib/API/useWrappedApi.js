import { useDialog } from '../dialog/useDialog'
import { wrapper } from '../exceptions/utils'
import API from './api'

export const useWrappedApi = () => {
  const { showDialog } = useDialog()

  return wrapper(API, showDialog)
}
