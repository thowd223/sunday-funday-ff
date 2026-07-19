import { Link } from 'react-router-dom'
import { franchiseDisplayName } from '../lib/franchise'

/** A franchise's current display name, linking to its franchise page. */
export function FranchiseLink({ id, plain }: { id: string; plain?: boolean }) {
  const name = franchiseDisplayName(id)
  if (plain) {
    return <>{name}</>
  }
  return (
    <Link className="mgr-link" to={`/franchises/${id}`}>
      {name}
    </Link>
  )
}
