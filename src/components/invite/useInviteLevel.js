import { useState } from 'react'
import GDStore from '../../lib/undux/GDStore'

const useInviteLevel = () => {
  const gdstore = GDStore.useStore()
  const [level, setInviteLevel] = useState(() => gdstore.get('inviteLevel') || {})

  const setLevel = value => {
    gdstore.set('inviteLevel')(value)
    setInviteLevel(value)
  }

  return { level, setLevel }
}
export default useInviteLevel
