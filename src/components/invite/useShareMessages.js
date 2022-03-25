import { pick } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import API from '../../lib/API/api'

const shareMessagesStrings = ['shareTitle', 'shareMessage', 'shortShareMessage']

const useShareMessages = () => {
  const [messages, setMessages] = useState(null)

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await API.getMessageStrings()

      setMessages(pick(data, shareMessagesStrings))
    }

    loadMessages()
  }, [setMessages])

  const loadedMessages = useMemo(() => messages || {}, [messages])
  const loaded = useMemo(() => !!messages, [messages])

  return [loadedMessages, loaded]
}

export default useShareMessages
