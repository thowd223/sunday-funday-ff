import { Navigate } from 'react-router-dom'

/** The trophy case merged into the Seasons index — redirect so old links keep working. */
export function Champions() {
  return <Navigate to="/seasons" replace />
}
