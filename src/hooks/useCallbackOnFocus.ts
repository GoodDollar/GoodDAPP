import { useEffect } from 'react'

export default function useCallbackOnFocus(callback: () => void): void {
    useEffect(() => {
        function invokeOnFocusHandler() {
            if (document.visibilityState === 'visible') callback()
        }

        document.addEventListener('visibilitychange', invokeOnFocusHandler)
        return () => document.removeEventListener('visibilitychange', invokeOnFocusHandler)
    }, [callback])
}
