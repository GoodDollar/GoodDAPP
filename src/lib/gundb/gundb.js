import Gun from 'gun'
import SEA from 'gun/sea'
import Config from '../../config/config'

const initGunDB = () => {
  if (!global.gun) global.gun = Gun([Config.GoodServer + '/gun'])
}

export default initGunDB
