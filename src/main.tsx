import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/legacy.css'
import './styles/shell.css'
import { App } from './App'
import { flushAndPush } from './state/store'
import { useContentStore } from './content/runtime'
import { useAuth } from './auth/store'

// Load the list of installable course packs (non-blocking).
void useContentStore.getState().refreshManifest()
// Restore any existing session before first paint.
useAuth.getState().bootstrap()

// Persist + push to remote when the tab is hidden or closed.
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushAndPush()
})
window.addEventListener('pagehide', flushAndPush)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
