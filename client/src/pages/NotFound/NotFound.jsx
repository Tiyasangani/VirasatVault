import Button from '../../components/Button/Button'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <section className="notfound">
      <div className="container">
        <p className="nf-code" aria-hidden="true">404</p>
        <h1>This story hasn’t been discovered yet.</h1>
        <p>The page you are looking for may have moved, or it may be waiting for someone to write it.</p>
        <div className="inline-actions"><Button to="/">Return to Heritage</Button><Button to="/contribute" variant="secondary">Contribute it</Button></div>
      </div>
    </section>
  )
}
