import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award } from 'lucide-react'
import { api } from '../../api/client'
import { CardSkeleton } from '../../components/LoadingSkeleton/LoadingSkeleton'
import { EmptyState, ErrorState } from '../../components/States/States'
import { DISTRICTS } from '../../data/categories'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Contributors() {
  useDocumentTitle('Contributors')
  const [district, setDistrict] = useState('')
  const [list, setList] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setList(null); setError(null)
    api.contributors(district).then(setList).catch((e) => setError(e.message))
  }, [district])

  return (
    <>
      <section className="page-head"><div className="container"><h1>Contributors</h1><p>The people who document and verify their community’s heritage. Points come from approved contributions.</p></div></section>
      <section className="section-tight"><div className="container narrow">
        <div className="tabs" role="tablist" aria-label="District">
          <button role="tab" aria-selected={!district} onClick={() => setDistrict('')}>All districts</button>
          {DISTRICTS.slice(0, 2).map((d) => <button key={d} role="tab" aria-selected={district === d} onClick={() => setDistrict(d)}>{d}</button>)}
        </div>
        {error ? <ErrorState onRetry={() => setDistrict((d) => d)} /> : !list ? <CardSkeleton count={2} />
          : list.length === 0 ? <EmptyState title="No contributors yet." text="Be the first to add a record in this district." />
          : (
            <ol className="leaderboard">
              {list.map((c, i) => (
                <li key={c.id}>
                  <span className="rank">{i + 1}</span>
                  <div className="lb-main">
                    <Link to={`/contributors/${c.id}`} className="lb-name">{c.name}</Link>
                    <span className="meta">{c.village}, {c.district} District</span>
                    <span className="lb-level"><Award size={15} aria-hidden="true" /> {c.level}</span>
                  </div>
                  <dl className="lb-stats"><div><dt>Approved</dt><dd>{c.approved}</dd></div><div><dt>Points</dt><dd>{c.points}</dd></div></dl>
                </li>
              ))}
            </ol>
          )}
      </div></section>
    </>
  )
}
