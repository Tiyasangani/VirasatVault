import { Component } from 'react'

// If any page crashes while drawing, show a friendly message instead of a blank white screen.
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error('Page error:', error) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="admin-gate">
        <h1>Something went wrong.</h1>
        <p>This page could not be shown. Please try again, or go back to the home page.</p>
        <div className="inline-actions">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload the page</button>
          <a className="btn btn-secondary" href="/">Go to home</a>
        </div>
      </div>
    )
  }
}
