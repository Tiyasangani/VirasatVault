import { useEffect } from 'react'
import { SITE_NAME, TAGLINE } from '../config'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – ${SITE_NAME}` : `${SITE_NAME} – ${TAGLINE}`
  }, [title])
}
