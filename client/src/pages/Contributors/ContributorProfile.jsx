import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award } from 'lucide-react'
import { api } from '../../api/client'
import SmartImage from '../../components/SmartImage/SmartImage'
import { VerifiedMark } from '../../components/Badge/Badge'
import { ErrorState } from '../../components/States/States'
import { BADGES } from '../../data/admin'
import { formatDate } from '../../utils/format'
import NotFound from '../NotFound/NotFound'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function ContributorProfile() {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [error, setError] = useState(null)
  useDocumentTitle(person?.name)

  useEffect(() => {
    setPerson(null); setError(null)
    api.contributor(id).then(setPerson).catch((e) => setError(e))
  }, [id])

  if (error) return error.status === 404 ? <NotFound /> : <ErrorState />
  if (!person) return <section className="section container"><p className="muted">Loading...</p></section>
  const earned = BADGES.filter((b) => b.points <= person.points)

  return (
    <>
      <section className="page-head profile-head">
        <div className="container profile-row">
          <div className="avatar" aria-hidden="true">{person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
          <div>
            <p className="breadcrumb"><Link to="/contributors">Contributors</Link> / {person.name}</p>
            <h1>{person.name}</h1>
            <p className="meta">{person.village}, {person.district} District. Member since {formatDate(person.joined, { month: 'long', year: 'numeric' })}</p>
            <p className="profile-title"><Award size={17} aria-hidden="true" /> {person.level}</p>
          </div>
          <dl className="profile-stats"><div><dt>Approved</dt><dd>{person.approved}</dd></div><div><dt>Points</dt><dd>{person.points}</dd></div></dl>
        </div>
      </section>
      <section className="section-tight"><div className="container">
        <h2>Badges</h2>
        <ul className="badge-list badge-row">{earned.length ? earned.map((b) => <li key={b.name} className="is-earned"><Award size={22} aria-hidden="true" /><div><h3 className="card-title">{b.name}</h3><p className="card-text">{b.text}</p></div></li>) : <li className="muted">No badges yet.</li>}</ul>
        <h2 className="admin-h2">Approved contributions</h2>
        {person.records.length === 0 ? <p className="muted">No approved contributions yet.</p> : (
          <ul className="record-list">
            {person.records.map((r) => (
              <li key={r.id}>
                {r.image && <SmartImage src={r.image} alt={r.title} ratio="1 / 1" />}
                <div>
                  <h3 className="card-title">{r.slug ? <Link to={`/heritage/${r.slug}`}>{r.title}</Link> : r.title}</h3>
                  <p className="meta">{r.category}, {r.village}</p>
                  {r.slug && <VerifiedMark verified={r.verified} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div></section>
    </>
  )
}
