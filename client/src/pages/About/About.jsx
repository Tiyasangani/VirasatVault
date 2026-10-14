import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import SmartImage from '../../components/SmartImage/SmartImage'
import { IMG } from '../../data/images'
import { BADGES } from '../../data/admin'
import { DESCRIPTION, TAGLINE } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function About() {
  useDocumentTitle('About')
  return (
    <>
      <section className="page-head"><div className="container"><h1>About VirasatVault</h1><p className="page-tagline">{TAGLINE}</p><p>{DESCRIPTION}</p></div></section>
      <section className="section-tight"><div className="container article-grid">
        <div className="prose">
          <h2>Why a separate platform?</h2>
          <p><em>Virasat</em> means heritage, the legacy handed down from one generation to the next. A <em>vault</em> is a place where valuable things are kept safe. VirasatVault is the vault for the places, stories, skills and voices of our villages. A search engine finds what has already been published. Much of local heritage has not: village histories, elders’ memories, family photographs and traditions that exist only in conversation.</p>
          <h2>How a record is made</h2>
          <ol className="steps">
            <li><strong>Discover.</strong> Browse villages, places, stories and events.</li>
            <li><strong>Contribute.</strong> Submit what you know with a source, however informal.</li>
            <li><strong>Verify.</strong> Reviewers approve, reject or ask for changes. Not every claim becomes verified.</li>
            <li><strong>Preserve.</strong> Verified records receive a permanent record number and a QR code.</li>
            <li><strong>Explore.</strong> Anyone can search, map and share the archive.</li>
          </ol>
          <h2>Contributor recognition</h2>
          <p>Points and badges are shown on the public <Link className="text-link" to="/contributors">Contributors</Link> page.</p>
          <ul className="sources">{BADGES.map((b) => <li key={b.name}><span><strong>{b.name}.</strong> {b.text}.</span></li>)}</ul>
          <Button to="/contribute">Contribute heritage</Button>
        </div>
        <SmartImage src={IMG.street} alt="Old bazaar lane" ratio="4 / 5" />
      </div></section>
    </>
  )
}
