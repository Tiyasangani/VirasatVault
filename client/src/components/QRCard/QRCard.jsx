import { Link } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { villageName } from '../../data'
import { heritageUrl } from '../../utils/siteUrl'

// The QR value is the public address of this record, e.g. https://yoursite.com/heritage/old-stepwell-xyz
export default function QRCard({ record }) {
  return (
    <aside className="qr-card" aria-label="QR code for this heritage record">
      <div className="qr-code"><QRCodeSVG value={heritageUrl(record.slug)} size={116} bgColor="#FFFDF7" fgColor="#3A2A1E" level="M" /></div>
      <div>
        <h3 className="card-title">Scan to Explore This Heritage</h3>
        <p className="qr-name">{record.title}</p>
        <p className="meta">{villageName(record.village)}, {record.district}</p>
        <p className="card-text">{record.summary}</p>
        <p className="meta mono-id">{`/heritage/${record.slug}`}</p>
        <Link to={`/heritage/${record.slug}/poster`} className="text-link with-icon"><Printer size={14} aria-hidden="true" /> Printable poster</Link>
      </div>
    </aside>
  )
}
