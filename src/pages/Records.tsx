import { Navigate } from 'react-router-dom'

/** Records has moved into the Awards page; keep this route alive for old links. */
export function Records() {
  return <Navigate to="/awards" replace />
}
