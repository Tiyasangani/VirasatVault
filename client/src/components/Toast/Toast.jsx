import { useApp } from '../../context/AppContext'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && <div className="toast" key={toast.id}>{toast.message}</div>}
    </div>
  )
}
