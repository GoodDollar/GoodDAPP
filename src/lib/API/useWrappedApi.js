import { useDialog } from '../dialog/useDialog'
import wrapper from '../undux/utils/wrapper'
import API from './api'

export const useWrappedApi = () => {
  const { showDialog } = useDialog()
  return wrapper(API, showDialog)
}
