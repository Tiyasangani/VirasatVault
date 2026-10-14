import Assistant from '../../components/Assistant/Assistant'
import { DEMO } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function AskPage() {
  useDocumentTitle('Ask the archive')
  return (
    <section className="section-tight">
      <div className="container ask-page">
        <div className="ask-side">
          <h1>Ask VirasatVault</h1>
          <p>A reference desk for the archive. Ask a question and the answer links to the records it came from, so you can read the sources yourself.</p>
          <p className="meta">{DEMO ? 'Prototype: replies are scripted from the archive records.' : 'Answers are matched to records in the archive and always link back to them. Check the sources before relying on a date or claim.'}</p>
        </div>
        <div className="ask-panel"><Assistant /></div>
      </div>
    </section>
  )
}
