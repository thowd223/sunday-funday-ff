import { Link } from 'react-router-dom'
import { displayName } from '../data/league'

/** A manager's display name, linking to their career page. */
export function ManagerLink({ manager, plain }: { manager: string; plain?: boolean }) {
  const name = displayName(manager)
  if (plain) {
    return <>{name}</>
  }
  return (
    <Link className="mgr-link" to={`/managers/${manager}`}>
      {name}
    </Link>
  )
}
