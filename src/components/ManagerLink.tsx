import { Link } from 'react-router-dom'
import { displayName, USER_USERNAME } from '../data/league'

/** A manager's display name, linking to their career page, with a "YOU" tag for the user. */
export function ManagerLink({ manager, plain }: { manager: string; plain?: boolean }) {
  const name = displayName(manager)
  const isUser = manager === USER_USERNAME
  if (plain) {
    return (
      <>
        {name}
        {isUser && <span className="tag-you">YOU</span>}
      </>
    )
  }
  return (
    <Link className="mgr-link" to={`/managers/${manager}`}>
      {name}
      {isUser && <span className="tag-you">YOU</span>}
    </Link>
  )
}
