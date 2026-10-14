import { BadgeCheck, CircleDashed, Clock, Eye, FilePenLine, XCircle, CheckCircle2 } from 'lucide-react'

export function VerifiedMark({ verified }) {
  return verified ? (
    <span className="mark mark-verified"><BadgeCheck size={15} aria-hidden="true" /> Verified Heritage</span>
  ) : (
    <span className="mark mark-unverified"><CircleDashed size={15} aria-hidden="true" /> Awaiting verification</span>
  )
}

const STATUS = {
  Pending: { cls: 'st-pending', icon: Clock },
  'Under Review': { cls: 'st-review', icon: Eye },
  Approved: { cls: 'st-approved', icon: CheckCircle2 },
  Rejected: { cls: 'st-rejected', icon: XCircle },
  'Changes Requested': { cls: 'st-changes', icon: FilePenLine },
  Open: { cls: 'st-pending', icon: Clock },
  Resolved: { cls: 'st-approved', icon: CheckCircle2 },
}

export function StatusMark({ status }) {
  const { cls, icon: Icon } = STATUS[status] ?? STATUS.Pending
  return <span className={`status ${cls}`}><Icon size={14} aria-hidden="true" /> {status}</span>
}

// Plain text tag; used sparingly for categories.
export function Tag({ children }) {
  return <span className="tag">{children}</span>
}
