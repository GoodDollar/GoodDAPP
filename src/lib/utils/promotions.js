import moment from 'moment'
import config from '../../config/config'

const { cryptoLiteracyNovemberEndDate } = config

export const isCryptLiteracyNovember = () => moment().isSameOrBefore(cryptoLiteracyNovemberEndDate, 'day')
