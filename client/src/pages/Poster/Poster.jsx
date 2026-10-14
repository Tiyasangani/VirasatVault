import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import SmartImage from '../../components/SmartImage/SmartImage'
import Button from '../../components/Button/Button'
import { getHeritage, villageName } from '../../data'
import { heritageUrl } from '../../utils/siteUrl'
import NotFound from '../NotFound/NotFound'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// A4 poster. "Print" opens the browser print dialog; choose "Save as PDF" to get a file.
export default function Poster() {
  const { slug } = useParams()
  const record = getHeritage(slug)
  useDocumentTitle(record ? `Poster: ${record.title}` : 'Poster')
  if (!record) return <NotFound />

  if (!record.verified) {
    return (
      <section className="section container narrow state">
        <h1>Posters are for verified records only</h1>
        <p>This record is still awaiting verification, so a public QR poster is not available yet.</p>
        <Link className="btn btn-secondary" to={`/heritage/${record.slug}`}>Back to the record</Link>
      </section>
    )
  }
  const url = heritageUrl(record.slug)
  return (
    <section className="poster-page">
      <div className="poster-tools no-print">
        <Link to={`/heritage/${record.slug}`} className="text-link">Back to the record</Link>
        <Button onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print or save as PDF</Button>
      </div>
      <article className="poster">
        <p className="poster-brand">VirasatVault · Every Place Has a Past. Every Story Deserves a Future.</p>
        <SmartImage src={record.image} alt={record.title} ratio="3 / 2" eager />
        <h1>{record.title}</h1>
        <p className="poster-place">{villageName(record.village)}, {record.district} District, Gujarat</p>
        <p className="poster-summary">{record.summary}</p>
        <div className="poster-qr">
          <QRCodeSVG value={url} size={190} bgColor="#FFFFFF" fgColor="#3A2A1E" level="M" />
          <div>
            <h2>Scan to Explore This Heritage</h2>
            <p>Read the full history, see photographs and sources, and add what you know.</p>
            <p className="poster-url">{url}</p>
            <p className="meta">Record {record.recordNo} · Verified Heritage</p>
          </div>
        </div>
      </article>
    </section>
  )
}
