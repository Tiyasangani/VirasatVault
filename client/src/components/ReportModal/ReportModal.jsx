import { useState } from 'react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import { REPORT_REASONS } from '../../data/admin'
import { useApp } from '../../context/AppContext'

export default function ReportModal({ target, onClose }) {
  const { addReport } = useApp()
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [errors, setErrors] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!reason) next.reason = 'Choose the reason that fits best.'
    if (detail.trim().length < 15) next.detail = 'Please add at least a sentence so reviewers know what to check.'
    setErrors(next)
    if (Object.keys(next).length) return
    try {
      await addReport({ target, reason, detail: detail.trim() })
      onClose()
    } catch (err) {
      setErrors({ detail: err.fields?.detail ?? err.message })
    }
  }

  return (
    <Modal title="Report a problem" onClose={onClose}>
      <p className="muted">You are reporting <strong>{target}</strong>. A reviewer will check it against the listed sources.</p>
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.reason ? 'has-error' : ''}`}>
          <label htmlFor="report-reason">Reason</label>
          <select id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={!!errors.reason}>
            <option value="">Select a reason</option>
            {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          {errors.reason && <p className="field-error">{errors.reason}</p>}
        </div>
        <div className={`field ${errors.detail ? 'has-error' : ''}`}>
          <label htmlFor="report-detail">What is wrong?</label>
          <textarea id="report-detail" rows="4" maxLength={500} value={detail} onChange={(e) => setDetail(e.target.value)} aria-invalid={!!errors.detail} />
          <div className="field-foot">{errors.detail ? <p className="field-error">{errors.detail}</p> : <span />}<span className="count">{detail.length}/500</span></div>
        </div>
        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <button type="submit" className="btn btn-primary">Send report</button>
        </div>
      </form>
    </Modal>
  )
}
