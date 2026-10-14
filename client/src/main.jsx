import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { AppProvider } from './context/AppContext'
import { LightboxProvider } from './components/Lightbox/Lightbox'
import { api, ApiError } from './api/client'
import { hydrate } from './data'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/extras.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

function StartupError({ message }) {
  return (
    <div className="admin-gate">
      <h1>VirasatVault could not load</h1>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
    </div>
  )
}

// Load the public records first so every page can read them straight away.
async function start() {
  try {
    hydrate(await api.bootstrap())
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <AppProvider>
            <ErrorBoundary>
              <LightboxProvider>
                <App />
              </LightboxProvider>
            </ErrorBoundary>
          </AppProvider>
        </BrowserRouter>
      </React.StrictMode>,
    )
  } catch (err) {
    root.render(<StartupError message={err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'} />)
  }
}
start()

// Offline support and "install as an app" (production builds only, so development is never confused by old copies).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}) })
}
